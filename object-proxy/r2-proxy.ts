import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { getDocumentUrl } from '../backend/r2/documentService';
import { PrismaClient } from '@prisma/client';
import zlib from 'zlib';
import { promisify } from 'util';

// Get the current file path and directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
const envResult = config({ path: path.resolve(__dirname, '../.env') });
if (envResult.error) {
  console.error('[R2-PROXY] Error loading .env file:', envResult.error);
} else {
  console.log('[R2-PROXY] Successfully loaded environment variables from .env file');
  console.log('[R2-PROXY] R2 bucket name:', process.env.R2_BUCKET_NAME);
}

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

// Get content type based on file extension
const getContentType = (filePath: string): string => {
  const extension = path.extname(filePath).toLowerCase();
  
  console.log(`[R2-PROXY] Detecting content type for file extension: ${extension}`);
  
  // Map of file extensions to MIME types
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.ppt': 'application/vnd.ms-powerpoint'
  };
  
  const contentType = mimeTypes[extension] || 'application/octet-stream';
  console.log(`[R2-PROXY] Mapped extension ${extension} to content type: ${contentType}`);
  return contentType;
};

// Proxy route to handle R2 document fetching
router.get('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const cacheKey = `doc_${documentId}`;
    const now = Date.now();
    
    console.log(`[R2-PROXY] Request for document: ${documentId}`);
    console.log(`[R2-PROXY] Environment variables check:`, {
      R2_ENDPOINT: process.env.R2_ENDPOINT ? 'Set' : 'Not set',
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? 'Set' : 'Not set',
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? 'Set' : 'Not set',
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'Not set'
    });
    
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
    try {
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
      let filePath = document.filePath;
      
      if (isCompressedFile(document.filePath)) {
        console.log(`[R2-PROXY] File is compressed, decompressing...`);
        fileData = await gunzipAsync(Buffer.from(response.data));
        console.log(`[R2-PROXY] File decompressed, new size: ${fileData.length} bytes`);
        
        // Remove .gz extension for content type detection
        filePath = filePath.slice(0, -3);
      }
      
      // Set appropriate content type based on file extension
      let contentType = getContentType(filePath);
      
      // If the original file was PowerPoint or Word but has been converted to PDF,
      // we need to ensure it gets the PDF content type
      if (filePath.endsWith('.pdf')) {
        contentType = 'application/pdf';
        console.log(`[R2-PROXY] Ensuring PDF content type for converted file: ${filePath}`);
      }
      
      console.log(`[R2-PROXY] Final content type: ${contentType}`);
      
      // Get the file extension for the filename
      const extension = path.extname(filePath) || '.bin';
      const baseName = document.title || 'document';
      const fileName = `${baseName}${extension}`;
      
      // Cache the document data for future requests
      documentCache.set(cacheKey, {
        contentType,
        filename: fileName,
        data: Buffer.from(fileData),
        expiresAt: now + CACHE_TTL
      });
      
      // Send the response
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      
      // Log headers being sent
      console.log(`[R2-PROXY] Sending response with Content-Type: ${contentType}`);
      console.log(`[R2-PROXY] Content-Disposition: inline; filename="${fileName}"`);
      
      // Additional headers to improve cross-origin compatibility
      res.setHeader('Cache-Control', 'public, max-age=1800');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type');
      res.setHeader('X-Cache', 'MISS');
      
      return res.send(fileData);
    } catch (error) {
      console.error('[R2-PROXY] Error in document retrieval:', error);
      if (error.response) {
        console.error('[R2-PROXY] Error response data:', error.response.status, error.response.statusText);
      }
      throw error; // Let the outer catch handler manage the error response
    }
  } catch (error) {
    console.error('[R2-PROXY] Error handling request:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message || 'Unknown error',
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
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