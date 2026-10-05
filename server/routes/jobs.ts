import { Router, Request, Response } from 'express';
import { jobManager } from '../services/jobs/jobManager.js';

export const jobsRouter = Router();

jobsRouter.get('/:jobId', (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  const job = jobManager.getJob(jobId);

  if (!job) {
    res.status(404).json({
      success: false,
      error: 'Job not found or expired.',
      code: 'JOB_NOT_FOUND',
    });
    return;
  }

  res.json({
    success: true,
    job,
  });
});
