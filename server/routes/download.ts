import { Router, Request, Response } from 'express';
import fs from 'fs';
import { jobManager } from '../services/jobs/jobManager.js';

export const downloadRouter = Router();

// GET /api/download/:jobId - File download with attachment headers
downloadRouter.get('/:jobId', (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  const job = jobManager.getInternalJob(jobId);

  if (!job || !job.output || !fs.existsSync(job.output.filePath)) {
    res.status(404).json({
      success: false,
      error: 'File not found or has expired.',
      code: 'FILE_NOT_FOUND',
    });
    return;
  }

  const { filePath, filename, mimeType } = job.output;

  res.setHeader('Content-Type', mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

export const previewRouter = Router();

// GET /api/preview/:jobId - Inline streaming for previews (images, pdfs)
previewRouter.get('/:jobId', (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  const job = jobManager.getInternalJob(jobId);

  if (!job || !job.output || !fs.existsSync(job.output.filePath)) {
    res.status(404).json({
      success: false,
      error: 'Preview file not found.',
      code: 'FILE_NOT_FOUND',
    });
    return;
  }

  const { filePath, filename, mimeType } = job.output;

  res.setHeader('Content-Type', mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});
