import fs from 'fs';
import path from 'path';
import { fileTypeFromFile } from 'file-type';
import { CONFIG } from '../../config.js';

export interface ValidationSuccess {
  isValid: true;
  detectedFormat: string;
  detectedMime: string;
  fileSizeBytes: number;
}

export interface ValidationFailure {
  isValid: false;
  errorCode:
    | 'FILE_TOO_LARGE'
    | 'INVALID_FILE'
    | 'UNSUPPORTED_FORMAT'
    | 'EMPTY_FILE';
  message: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validates file size, extension, MIME, and magic bytes.
 */
export async function validateUploadedFile(
  filePath: string,
  originalFilename: string,
  claimedMimeType?: string
): Promise<ValidationResult> {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        isValid: false,
        errorCode: 'INVALID_FILE',
        message: "That doesn't look like a valid file. Try another one.",
      };
    }

    const stats = await fs.promises.stat(filePath);

    // 1. File Size Validation
    if (stats.size === 0) {
      return {
        isValid: false,
        errorCode: 'EMPTY_FILE',
        message: 'The selected file is empty (0 bytes).',
      };
    }

    if (stats.size > CONFIG.MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        errorCode: 'FILE_TOO_LARGE',
        message: 'That file is larger than 500 MB. Please choose a smaller file.',
      };
    }

    // 2. Extension extraction
    const ext = path.extname(originalFilename).toLowerCase().replace(/^\./, '');
    if (!ext) {
      return {
        isValid: false,
        errorCode: 'UNSUPPORTED_FORMAT',
        message: 'The file has no recognized extension.',
      };
    }

    // 3. Binary Magic Byte Validation where available
    const detected = await fileTypeFromFile(filePath);

    let finalFormat = ext;
    let finalMime = claimedMimeType || 'application/octet-stream';

    if (detected) {
      finalMime = detected.mime;
      const detectedExt = detected.ext.toLowerCase();

      // Normalize jpg/jpeg
      const normDetected = detectedExt === 'jpg' ? 'jpeg' : detectedExt;
      const normExt = ext === 'jpg' ? 'jpeg' : ext;

      // Allow docx/xlsx (which are zip-based containers internally)
      const isZipContainer =
        detectedExt === 'zip' && ['docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp'].includes(ext);

      if (normDetected !== normExt && !isZipContainer) {
        // If magic bytes contradict extension (e.g. executable disguised as pdf)
        if (
          ['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf', 'avif', 'tiff'].includes(normDetected)
        ) {
          finalFormat = (detected.ext as string) === 'jpg' ? 'jpg' : detected.ext;
        }
      }
    } else {
      // Text-based files (txt, md, csv, html) don't have binary magic bytes
      const textExtensions = ['txt', 'md', 'csv', 'html', 'json'];
      if (textExtensions.includes(ext)) {
        // Sample first 4KB to ensure it's valid text and doesn't contain null bytes
        const fd = await fs.promises.open(filePath, 'r');
        const buffer = Buffer.alloc(Math.min(4096, stats.size));
        await fd.read(buffer, 0, buffer.length, 0);
        await fd.close();

        // Check for binary null bytes
        let nullByteCount = 0;
        for (let i = 0; i < buffer.length; i++) {
          if (buffer[i] === 0) nullByteCount++;
        }

        if (nullByteCount > 2) {
          return {
            isValid: false,
            errorCode: 'INVALID_FILE',
            message: "That doesn't look like a valid text file. It may be corrupt or binary data.",
          };
        }

        finalFormat = ext;
        finalMime = ext === 'html' ? 'text/html' : ext === 'csv' ? 'text/csv' : 'text/plain';
      }
    }

    return {
      isValid: true,
      detectedFormat: finalFormat,
      detectedMime: finalMime,
      fileSizeBytes: stats.size,
    };
  } catch (err: any) {
    console.error('[FileValidator] Error validating file:', err);
    return {
      isValid: false,
      errorCode: 'INVALID_FILE',
      message: "That doesn't look like a valid file. Try another one.",
    };
  }
}
