import path from 'path';

/**
 * Sanitizes a filename to prevent directory traversal and remove problematic characters.
 */
export function sanitizeFilename(filename: string): string {
  // Strip null bytes and control chars
  let clean = filename.replace(/[\x00-\x1f\x80-\x9f]/g, '');
  
  // Get base name only (strip path traversal characters like ../ or ..\)
  clean = path.basename(clean);
  
  // Replace unsafe shell and filesystem characters with underscores
  clean = clean.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Collapse multiple underscores or dots
  clean = clean.replace(/_+/g, '_').replace(/\.+/g, '.');
  
  if (!clean || clean === '.') {
    clean = 'file';
  }
  
  return clean;
}

/**
 * Generates an output filename given the original file name and target extension.
 * E.g., 'report.pdf' -> 'report-converted.docx'
 */
export function generateOutputFilename(originalName: string, targetExt: string): string {
  const sanitized = sanitizeFilename(originalName);
  const parsed = path.parse(sanitized);
  const cleanExt = targetExt.startsWith('.') ? targetExt.slice(1) : targetExt;
  return `${parsed.name}-converted.${cleanExt}`;
}
