import { Router, Request, Response } from 'express';
import { engineRegistry } from '../services/engineRegistry.js';

export const formatsRouter = Router();

formatsRouter.get('/', (_req: Request, res: Response) => {
  const catalog = engineRegistry.getFormatsCatalog();
  res.json({
    success: true,
    catalog,
  });
});
