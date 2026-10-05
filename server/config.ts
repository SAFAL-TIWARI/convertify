import path from 'path';

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  MAX_FILE_SIZE_BYTES: 500 * 1024 * 1024, // 500 MB strict limit
  MAX_FILE_SIZE_MB: 500,
  TEMP_DIR: path.resolve(process.cwd(), 'temp'),
  UPLOADS_DIR: path.resolve(process.cwd(), 'temp', 'uploads'),
  OUTPUTS_DIR: path.resolve(process.cwd(), 'temp', 'outputs'),
  JOB_EXPIRATION_MS: 30 * 60 * 1000, // 30 minutes TTL
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // Every 5 minutes
};
