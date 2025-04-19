import express from 'express';
import axios from 'axios';
import { getDocumentUrl } from '../backend/r2/documentService';
import { PrismaClient } from '@prisma/client';
import zlib from 'zlib';
import { promisify } from 'util';

const router = express.Router();
const prisma = new PrismaClient();

// Promisify gunzip
const gunzipAsync = promisify(zlib.gunzip);

// Simple in-memory cache (we'll use a Map instead of node-cache to avoid dependencies)
const documentCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

// Helper function to check if a file is compressed
const isCompressedFile = (filePath: string): boolean => {
  return filePath.endsWith('.gz');
};

// Proxy route to handle R2 document fetching
router.get('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const cacheKey = `doc_${documentId}`;
    const now = Date.now();
    
    console.log(`[R2-PROXY] Request for document: ${documentId}`);
    
    // Check if we have the document in cache and it's not expired
    const cachedEntry = documentCache.get(cacheKey);
    if (cachedEntry && now < cachedEntry.expiresAt) {
      const { contentType, filename, data } = cachedEntry;
      
      console.log(`[R2-PROXY] Cache HIT for ${documentId}, content type: ${contentType}`);
      
      // Set proper headers for CORS and caching
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=1800');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('X-Cache', 'HIT');
      return res.send(data);
    }
    
    // Get document details from database
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });
    
    if (!document) {
      console.log(`[R2-PROXY] Document not found: ${documentId}`);
      return res.status(404).json({ error: 'Document not found' });
    }
    
    console.log(`[R2-PROXY] Document found: ${document.title}, filePath: ${document.filePath}`);
    
    // Get the presigned URL from R2
    const presignedUrl = await getDocumentUrl(document.filePath);
    console.log(`[R2-PROXY] Generated presigned URL for ${document.filePath}`);
    
    // Fetch the file from R2 using the presigned URL
    console.log(`[R2-PROXY] Fetching file from R2...`);
    const response = await axios.get(presignedUrl, {
      responseType: 'arraybuffer',
      // Add a larger timeout to prevent network issues
      timeout: 10000
    });
    console.log(`[R2-PROXY] File fetched from R2, size: ${response.data.length} bytes`);
    
    // Check if the file is compressed and decompress if needed
    let fileData = response.data;
    if (isCompressedFile(document.filePath)) {
      console.log(`[R2-PROXY] File is compressed, decompressing...`);
      fileData = await gunzipAsync(Buffer.from(response.data));
      console.log(`[R2-PROXY] File decompressed, new size: ${fileData.length} bytes`);
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
    
    console.log(`[R2-PROXY] Detected file extension: ${extension}`);
    
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
    
    console.log(`[R2-PROXY] Set content type to: ${contentType}`);
    
    // Cache the document data for future requests
    const fileName = `${document.title}.${extension}`;
    documentCache.set(cacheKey, {
      contentType,
      filename: fileName,
      data: Buffer.from(fileData),
      expiresAt: now + CACHE_TTL
    });
    
    // Set headers and send the file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Cache', 'MISS');
    res.send(fileData);
    
  } catch (error) {
    console.error('Error proxying document:', error);
    return res.status(500).json({ error: 'Failed to retrieve document' });
  }
});

// Add OPTIONS handler for CORS preflight requests
router.options('/:documentId', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

export default router; 