import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import r2ProxyRouter from './r2-proxy';

// Get the current file path and directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
const envResult = config({ path: path.resolve(__dirname, '../.env') });
if (envResult.error) {
  console.error('[OBJECT-PROXY] Error loading .env file:', envResult.error);
} else {
  console.log('[OBJECT-PROXY] Successfully loaded environment variables from .env file');
}

const router = express.Router();

// Mount the R2 proxy router
router.use('/r2', r2ProxyRouter);

export default router; 