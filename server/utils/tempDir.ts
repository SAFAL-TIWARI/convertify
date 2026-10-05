import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config.js';

/**
 * Ensures required temporary directories exist.
 */
export function initTempDirectories(): void {
  const dirs = [CONFIG.TEMP_DIR, CONFIG.UPLOADS_DIR, CONFIG.OUTPUTS_DIR];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Safely removes a file if it exists.
 */
export async function safeUnlink(filePath: string): Promise<void> {
  try {
    if (filePath && fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    console.error(`[Cleanup] Failed to unlink file ${filePath}:`, err);
  }
}

/**
 * Cleans up temporary files older than the specified max age.
 */
export async function cleanupExpiredFiles(maxAgeMs = CONFIG.JOB_EXPIRATION_MS): Promise<number> {
  let cleanedCount = 0;
  const now = Date.now();
  const dirs = [CONFIG.UPLOADS_DIR, CONFIG.OUTPUTS_DIR];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;

    try {
      const files = await fs.promises.readdir(dir);
      for (const file of files) {
        if (file === '.gitkeep') continue;
        const fullPath = path.join(dir, file);
        try {
          const stats = await fs.promises.stat(fullPath);
          if (now - stats.mtimeMs > maxAgeMs) {
            await fs.promises.unlink(fullPath);
            cleanedCount++;
          }
        } catch {
          // ignore stat/unlink errors for individual files
        }
      }
    } catch (err) {
      console.error(`[Cleanup] Failed reading directory ${dir}:`, err);
    }
  }

  return cleanedCount;
}
