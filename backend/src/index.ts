import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import classRoutes from './routes/classRoutes';
import postRoutes from './routes/postRoutes';
import offerRoutes from './routes/offerRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Allow CORS for Codespaces and localhost
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost for local development
    if (origin.includes('localhost')) return callback(null, true);

    // Allow GitHub Codespaces URLs
    if (origin.includes('preview.app.github.dev')) return callback(null, true);
    if (origin.includes('github.dev')) return callback(null, true);

    // Allow configured frontend URL
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    // In development, allow all
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/offers', offerRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Haas Trade Hub API Server                ║
║   Environment: ${process.env.NODE_ENV || 'development'}                    ║
║   Port: ${PORT}                               ║
║   Time: ${new Date().toLocaleString()}      ║
╚════════════════════════════════════════════╝
  `);
});

export default app;
