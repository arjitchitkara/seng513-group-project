import express from 'express';
import axios from 'axios';
import { getDocumentUrl } from '../backend/r2/documentService';
import { PrismaClient } from '@prisma/client';
import zlib from 'zlib';
import { promisify } from 'util';
import NodeCache from 'node-cache';

const router = express.Router();
const prisma = new PrismaClient();

// Promisify gunzip
const gunzipAsync = promisify(zlib.gunzip);

// Document cache (TTL: 30 minutes, check period: 60 seconds)
const documentCache = new NodeCache({ 
  stdTTL: 1800, 
  checkperiod: 60,
  useClones: false // For better memory usage with large buffers
});

// Helper function to check if a file is compressed
const isCompressedFile = (filePath: string): boolean => {
  return filePath.endsWith('.gz');
};

// Proxy route to handle R2 document fetching
router.get('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const cacheKey = `doc_${documentId}`;
    
    // Check if we have the document in cache
    const cachedDocument = documentCache.get(cacheKey);
    if (cachedDocument) {
      const { contentType, filename, data } = cachedDocument as { 
        contentType: string, 
        filename: string, 
        data: Buffer 
      };
      
      console.log(`Serving document ${documentId} from cache`);
      
      // Set headers and send cached file
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 minutes browser caching
      res.setHeader('X-Cache', 'HIT');
      return res.send(data);
    }
    
    // Get document details from database
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Get the presigned URL from R2
    const presignedUrl = await getDocumentUrl(document.filePath);
    
    // Fetch the file from R2 using the presigned URL
    const response = await axios.get(presignedUrl, {
      responseType: 'arraybuffer'
    });
    
    // Check if the file is compressed and decompress if needed
    let fileData = response.data;
    if (isCompressedFile(document.filePath)) {
      fileData = await gunzipAsync(Buffer.from(response.data));
    }
    
    // Set appropriate content type based on file extension
    let extension = document.filePath.split('.').pop()?.toLowerCase();
    // Remove .gz extension if present to get the actual file type
    if (extension === 'gz') {
      const parts = document.filePath.split('.');
      if (parts.length > 2) {
        extension = parts[parts.length - 2].toLowerCase();
      }
    }
    
    let contentType = 'application/octet-stream';
    
    if (extension === 'pdf') {
      contentType = 'application/pdf';
    } else if (extension === 'docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (extension === 'pptx') {
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (extension === 'txt') {
      contentType = 'text/plain';
    }
    
    // Cache the document data for future requests
    const fileName = `${document.title}.${extension}`;
    documentCache.set(cacheKey, {
      contentType,
      filename: fileName,
      data: Buffer.from(fileData)
    });
    
    console.log(`Caching document ${documentId} (${Buffer.from(fileData).length / 1024} KB)`);
    
    // Set headers and send the file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 minutes browser caching
    res.setHeader('X-Cache', 'MISS');
    res.send(fileData);
    
  } catch (error) {
    console.error('Error proxying document:', error);
    return res.status(500).json({ error: 'Failed to retrieve document' });
  }
});

export default router; 