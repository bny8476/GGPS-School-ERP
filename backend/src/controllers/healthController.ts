import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const getHealth = (req: Request, res: Response): void => {
  const dbState = mongoose.connection.readyState;
  const isConnected = dbState === 1;

  res.status(200).json({
    status: isConnected ? 'ok' : 'degraded',
    service: 'GGPS School ERP',
    database: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
};
