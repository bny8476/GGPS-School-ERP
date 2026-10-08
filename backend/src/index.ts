import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';

import env from './config/env';
import connectDB from './config/db';
import logger from './utils/logger';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { initSocket } from './socket';
import { registerDomainModules } from './modules';
import { swaggerDocument } from './config/swagger';

// Connect to MongoDB
connectDB();

const app = express();

// Allowed origins
const rawAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://ggsp-school-erp.vercel.app',
  'https://schoolerp-livid.vercel.app',
  'https://school-erp-bny2.vercel.app',
  env.CLIENT_URL,
  ...(env.CORS_ORIGINS ? env.CORS_ORIGINS.split(',').map((s) => s.trim()) : []),
].filter(Boolean) as string[];

const normalizeUrl = (url?: string) => (url ? url.replace(/\/+$/, '').toLowerCase() : '');
const allowedOrigins = rawAllowedOrigins.map(normalizeUrl);

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  const cleanOrigin = normalizeUrl(origin);
  if (allowedOrigins.includes(cleanOrigin)) return true;
  // Allow all Vercel deployments (production, staging, and branch previews)
  if (/^https:\/\/[a-z0-9-]+(\.vercel\.app)$/i.test(cleanOrigin)) {
    return true;
  }
  if (
    env.NODE_ENV !== 'production' &&
    (cleanOrigin.startsWith('http://localhost:') || cleanOrigin.startsWith('http://127.0.0.1:'))
  ) {
    return true;
  }
  return false;
};

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI and cross-origin assets in dev/staging
  })
);

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-Id',
    'Accept',
    'Cache-Control',
    'X-Requested-With',
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Dedicated strict rate limiter for authentication endpoints against brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/v1/auth/reset-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// OPTIONS preflight
app.options(/.*/, cors(corsOptions));

// Body and cookie parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request tracking & correlation logging
app.use(requestLogger);

// API Documentation via Swagger / OpenAPI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root Health Check routes (fail-safe status reporting & container pre-warming)
const healthHandler = (req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const dbStatus = isDbConnected ? 'connected' : 'disconnected';

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'unhealthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: dbStatus,
    readyState: mongoose.connection.readyState,
  });
};

app.get('/health', healthHandler);
app.get('/api/v1/health', healthHandler);

app.get('/health/db', (req: Request, res: Response) => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    res.status(200).json({
      status: 'up',
      database: 'MongoDB',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  } else {
    res.status(503).json({
      status: 'down',
      database: 'MongoDB',
      readyState: mongoose.connection.readyState,
    });
  }
});

// Root welcome message
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'GGPS School ERP Production API is operational',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
  });
});

// Global Database Availability Guard: Short-circuits non-health routes with 503 if DB is down
app.use((req: Request, res: Response, next: NextFunction) => {
  if (
    req.path === '/' ||
    req.path.startsWith('/health') ||
    req.path.startsWith('/api-docs')
  ) {
    return next();
  }

  // Fail-closed in any environment (except during automated isolated tests that mock DB)
  if (mongoose.connection.readyState !== 1 && env.NODE_ENV !== 'test') {
    return res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'Database connection is currently offline. Please try again shortly or contact system administrator.',
      databaseStatus: 'disconnected',
    });
  }

  next();
});

// Canonical API Router (supports both /api/v1 and legacy /api)
const apiRouter = express.Router();
registerDomainModules(apiRouter);

// Mount canonical /api/v1 for modular architecture AND /api for backward compatibility
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Centralized error handling
app.use(errorHandler);

const PORT = env.PORT || 5001;

// Create HTTP server for Express and Socket.IO
const httpServer = createServer(app);

// Initialize Socket.io with authenticated connections
initSocket(httpServer);

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    logger.info(`GGPS ERP Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    logger.info(`Swagger API documentation available at http://localhost:${PORT}/api-docs`);
  });
}

export { app, httpServer };
export default app;
