import express from 'express';
import cors from 'cors';
import { convertRouter } from './routes/convert.js';
import { jobsRouter } from './routes/jobs.js';
import { downloadRouter, previewRouter } from './routes/download.js';
import { formatsRouter } from './routes/formats.js';
import { diagnosticsRouter } from './routes/diagnostics.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initTempDirectories, cleanupExpiredFiles } from './utils/tempDir.js';

export function createApp() {
  // Ensure temp directories exist
  initTempDirectories();

  // Startup cleanup of old orphaned files
  cleanupExpiredFiles().then((count) => {
    if (count > 0) {
      console.log(`[Startup Cleanup] Removed ${count} orphaned temporary files.`);
    }
  });

  const app = express();

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/convert', convertRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/download', downloadRouter);
  app.use('/api/preview', previewRouter);
  app.use('/api/formats', formatsRouter);
  app.use('/api/diagnostics', diagnosticsRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
