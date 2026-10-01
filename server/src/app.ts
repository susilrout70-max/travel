import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import destinationsRoutes from './modules/destinations/destinations.routes';
import recommendationsRoutes from './modules/recommendations/recommendations.routes';
import hotelsRoutes from './modules/hotels/hotels.routes';
import vehiclesRoutes from './modules/vehicles/vehicles.routes';
import bookingsRoutes from './modules/bookings/bookings.routes';
import locationSharingRoutes from './modules/location-sharing/location-sharing.routes';
import liveInfoRoutes from './modules/live-info/live-info.routes';
import adminRoutes from './modules/admin/admin.routes';
import safetyRoutes from './modules/safety/safety.routes';
import tripsRoutes from './modules/trips/trips.routes';

export const createApp = (): Express => {
  const app = express();

  // Security Middlewares
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  const allowedOrigins = [
    config.clientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          origin.includes('localhost')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Core Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Rate Limiting on API
  app.use('/api', apiLimiter);

  // Health Endpoint
  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'TravelHub API Gateway',
      time: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });

  // Feature API Routers
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/destinations', destinationsRoutes);
  app.use('/api/v1/recommendations', recommendationsRoutes);
  app.use('/api/v1/hotels', hotelsRoutes);
  app.use('/api/v1/vehicles', vehiclesRoutes);
  app.use('/api/v1/bookings', bookingsRoutes);
  app.use('/api/v1/location-sharing', locationSharingRoutes);
  app.use('/api/v1/live-info', liveInfoRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/safety', safetyRoutes);
  app.use('/api/v1/trips', tripsRoutes);

  // 404 Handler for unrecognized API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
