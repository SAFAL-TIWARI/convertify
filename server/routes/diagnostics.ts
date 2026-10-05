import { Router, Request, Response } from 'express';
import { engineRegistry } from '../services/engineRegistry.js';

export const diagnosticsRouter = Router();

diagnosticsRouter.get('/', (_req: Request, res: Response) => {
  const diagnostics = engineRegistry.getDiagnostics();
  res.json({
    success: true,
    diagnostics,
  });
});

diagnosticsRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});
