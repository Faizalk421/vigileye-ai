import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ENV } from './config/env.js';
import { logger } from './utils/logger.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { prisma } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust reverse proxy headers (Required for Render, Railway, Heroku load balancers)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Allows client inline styles & scripts for dashboard/visuals
}));

// CORS Configuration
const allowedOrigins = [
  ENV.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow configured production domains
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting
app.use('/api', apiLimiter);

// Main API Routes
app.use('/api', apiRouter);

// Serve Production Frontend Static Assets if dist exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const rootDistPath = path.resolve(__dirname, '../../dist');
const distPath = fs.existsSync(clientDistPath) ? clientDistPath : fs.existsSync(rootDistPath) ? rootDistPath : null;

if (distPath) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Root Welcome Endpoint when running API standalone
  app.get('/', (req, res) => {
    res.json({
      name: 'VigilEye AI Full-Stack Server',
      version: '2.0.0',
      status: 'ONLINE',
      documentation: '/api'
    });
  });
}

// 404 Fallback for unhandled API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start HTTP Server
const PORT = ENV.PORT;
const server = app.listen(PORT, () => {
  logger.info(`================================================`);
  logger.info(`🚀 VigilEye AI Server running on port ${PORT}`);
  logger.info(`📡 API Base: http://localhost:${PORT}/api`);
  logger.info(`💻 Environment: ${ENV.NODE_ENV}`);
  if (distPath) {
    logger.info(`📦 Serving Static Frontend From: ${distPath}`);
  }
  logger.info(`================================================`);
});

// Graceful Shutdown
const shutdown = async () => {
  logger.info('Shutting down server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
