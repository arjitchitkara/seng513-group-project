import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// Get the current file path and directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
config({ path: path.resolve(__dirname, '../../.env') });

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

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

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
    
    // Convert buffer to File-like object for R2 upload
    const file = {
      buffer: fileBuffer,
      name: originalName,
      type: req.file.mimetype,
    };
    
    // Upload to R2
    const filePath = await uploadDocument(file, userId);
    
    return res.status(200).json({ filePath });
  } catch (error) {
    console.error('Error uploading file:', error);
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