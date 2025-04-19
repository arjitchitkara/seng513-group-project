import express from 'express';
import r2ProxyRouter from './r2-proxy';

const router = express.Router();

// Mount the R2 proxy router
router.use('/r2', r2ProxyRouter);

export default router; 