import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users';
import { initDatabase } from './db';

const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);

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