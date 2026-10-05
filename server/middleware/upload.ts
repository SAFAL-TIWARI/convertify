import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { CONFIG } from '../config.js';
import { sanitizeFilename } from '../utils/sanitize.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, CONFIG.UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBase = sanitizeFilename(file.originalname).replace(ext, '');
    cb(null, `${uuidv4()}-${safeBase}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: CONFIG.MAX_FILE_SIZE_BYTES, // 500 MB limit
  },
});
