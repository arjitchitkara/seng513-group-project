import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import {v2 as cloudinary} from "cloudinary";

// Get the current file path and directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
const envResult = config({ path: path.resolve(__dirname, '../../.env') });
if (envResult.error) {
  console.error('Error loading .env file:', envResult.error);
} else {
  console.log('Successfully loaded environment variables from .env file');
  // Log environment variables status for debugging (sensitive values are masked)
  const envDebug = {
    'R2_ENDPOINT': process.env.R2_ENDPOINT ? 'set' : 'not set',
    'R2_ACCESS_KEY_ID': process.env.R2_ACCESS_KEY_ID ? 'set' : 'not set',
    'R2_SECRET_ACCESS_KEY': process.env.R2_SECRET_ACCESS_KEY ? 'set' : 'not set',
    'R2_BUCKET_NAME': process.env.R2_BUCKET_NAME ? process.env.R2_BUCKET_NAME : 'not set',
    'DATABASE_URL': process.env.DATABASE_URL ? 'set' : 'not set',
    'CLOUDINARY_CLOUD_NAME=': process.env.CLOUDINARY_CLOUD_NAME,
    'CLOUDINARY_API_KEY=': process.env.CLOUDINARY_API_KEY ? 'set' : 'NOT SET',
    'CLOUDINARY_API_SECRET=': process.env.CLOUDINARY_API_SECRET ? 'set' : 'NOT SET',
    };
  console.log('Environment variables status:', envDebug);
}

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Request } from 'express';
import usersRouter from './routes/users';
import documentsRouter from './routes/documents';
import coursesRouter from './routes/courses';
import objectProxyRouter from '../../object-proxy';
import { initDatabase } from './db';
import { uploadDocument } from '../../backend/r2/documentService';
import { convertAndCompressFile } from '../../backend/conversion/fileConverter';
import bookmarksRouter from './routes/bookmarks';

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
	api_key: process.env.CLOUDINARY_API_KEY!,
	api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const app = express();
const port = process.env.API_PORT || 3001;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/proxy', objectProxyRouter);

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req: MulterRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Create Buffer from file
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const originalType = req.file.mimetype;
    
    console.log(`[API] Processing upload: ${originalName}, type: ${originalType}, size: ${fileBuffer.length} bytes`);
    
    // Create file object for conversion
    const file = {
      buffer: fileBuffer,
      name: originalName,
      type: originalType,
    };
    
    // Convert file to PDF if needed (except for PDFs and TXT files)
    console.log(`[API] Starting file conversion for: ${originalName}`);
    const { buffer: processedBuffer, fileName: processedFileName, mimeType: processedMimeType } = 
      await convertAndCompressFile(file);
    
    console.log(`[API] File processed: ${processedFileName}, converted type: ${processedMimeType}, size: ${processedBuffer.length} bytes`);
    
    // Upload processed file to R2
    const processedFile = {
      buffer: processedBuffer,
      name: processedFileName,
      type: processedMimeType,
    };
    
    console.log(`[API] Uploading processed file to R2: ${processedFileName}`);
    const filePath = await uploadDocument(processedFile, userId);
    console.log(`[API] Upload complete. File path: ${filePath}`);
    
    return res.status(200).json({ filePath });
  } catch (error) {
    console.error('[API] Error uploading file:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
// Initialize database before starting server
initDatabase().then(() => {
  app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
  });
});

export default app; 