import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Multer file size error specifically
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        error: 'That file is larger than 500 MB. Please choose a smaller file.',
        code: 'FILE_TOO_LARGE',
      });
      return;
    }
    res.status(400).json({
      success: false,
      error: 'File upload error: ' + err.message,
      code: 'UPLOAD_ERROR',
    });
    return;
  }

  console.error('[Server Error Handler]', err);

  // Return clean, user-friendly error without stack traces or sensitive internal paths
  res.status(500).json({
    success: false,
    error: 'Something went wrong while processing your request. Please try again.',
    code: 'INTERNAL_ERROR',
  });
}
