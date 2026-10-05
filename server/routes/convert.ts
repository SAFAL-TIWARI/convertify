import { Router, Request, Response } from 'express';
import { uploadMiddleware } from '../middleware/upload.js';
import { validateUploadedFile } from '../services/validation/fileValidator.js';
import { jobManager } from '../services/jobs/jobManager.js';
import { safeUnlink } from '../utils/tempDir.js';
import { ImageConversionOptions } from '../../shared/types/index.js';

export const convertRouter = Router();

convertRouter.post('/', uploadMiddleware.single('file'), async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    res.status(400).json({
      success: false,
      code: 'NO_FILE',
      error: 'Please select a file to convert.',
    });
    return;
  }

  const targetFormat = req.body.targetFormat;
  if (!targetFormat || typeof targetFormat !== 'string') {
    await safeUnlink(file.path);
    res.status(400).json({
      success: false,
      code: 'NO_TARGET_FORMAT',
      error: 'Please select an output format.',
    });
    return;
  }

  // Parse optional image conversion options
  let options: ImageConversionOptions | undefined;
  if (req.body.options) {
    try {
      options = typeof req.body.options === 'string'
        ? JSON.parse(req.body.options)
        : req.body.options;
    } catch {
      // ignore invalid options json
    }
  }

  // Validate the file
  const validation = await validateUploadedFile(
    file.path,
    file.originalname,
    file.mimetype
  );

  if (!validation.isValid) {
    await safeUnlink(file.path);
    res.status(400).json({
      success: false,
      code: validation.errorCode,
      error: validation.message,
    });
    return;
  }

  // Create and execute job
  const jobResult = await jobManager.createAndExecuteJob({
    inputFilePath: file.path,
    originalFilename: file.originalname,
    inputFormat: validation.detectedFormat,
    targetFormat: targetFormat.trim(),
    fileSizeBytes: validation.fileSizeBytes,
    mimeType: validation.detectedMime,
    options,
  });

  if (jobResult.status === 'FAILED') {
    res.status(400).json({
      success: false,
      jobId: jobResult.jobId,
      status: jobResult.status,
      error: jobResult.error || 'Conversion failed.',
    });
    return;
  }

  res.json({
    success: true,
    ...jobResult,
  });
});
