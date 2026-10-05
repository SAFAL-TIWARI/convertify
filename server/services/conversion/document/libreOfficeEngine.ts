import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { ConversionEngine, ConversionResult } from '../engineInterface.js';

export class LibreOfficeEngine implements ConversionEngine {
  readonly name = 'LibreOffice Headless Engine';

  private binaryPath: string | null = null;
  private checked = false;

  private supportedFormats = new Set([
    'doc',
    'docx',
    'odt',
    'rtf',
    'txt',
    'html',
    'pdf',
    'ppt',
    'pptx',
    'odp',
    'xls',
    'xlsx',
    'ods',
    'csv',
  ]);

  constructor() {
    this.findBinary();
  }

  findBinary(): string | null {
    if (this.checked && this.binaryPath) {
      return this.binaryPath;
    }

    const candidatePaths: string[] = [];

    if (process.platform === 'win32') {
      candidatePaths.push(
        'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
        'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
        'soffice.exe'
      );
    } else if (process.platform === 'darwin') {
      candidatePaths.push(
        '/Applications/LibreOffice.app/Contents/MacOS/soffice',
        'soffice'
      );
    } else {
      candidatePaths.push(
        '/usr/bin/soffice',
        '/usr/bin/libreoffice',
        'soffice'
      );
    }

    for (const p of candidatePaths) {
      try {
        if (p.includes(path.sep) && fs.existsSync(p)) {
          this.binaryPath = p;
          this.checked = true;
          return this.binaryPath;
        }
      } catch {
        // continue
      }
    }

    this.checked = true;
    return this.binaryPath;
  }

  isAvailable(): boolean {
    return Boolean(this.findBinary());
  }

  getBinaryPath(): string | null {
    return this.binaryPath;
  }

  canConvert(inputFormat: string, outputFormat: string): boolean {
    if (!this.isAvailable()) return false;
    const inExt = inputFormat.toLowerCase().replace(/^\./, '');
    const outExt = outputFormat.toLowerCase().replace(/^\./, '');

    if (inExt === outExt) return false;
    return this.supportedFormats.has(inExt) && this.supportedFormats.has(outExt);
  }

  async convert(
    inputPath: string,
    outputPath: string,
    inputFormat: string,
    outputFormat: string
  ): Promise<ConversionResult> {
    const binary = this.findBinary();
    if (!binary) {
      return {
        success: false,
        bytesWritten: 0,
        error: 'LibreOffice is not installed on this machine.',
      };
    }

    const outDir = path.dirname(outputPath);
    const targetExt = outputFormat.toLowerCase().replace(/^\./, '');

    return new Promise((resolve) => {
      // Prepare isolated child process with argument array (no shell interpolation)
      const args = [
        '--headless',
        '--convert-to',
        targetExt,
        inputPath,
        '--outdir',
        outDir,
      ];

      const child = spawn(binary, args, {
        windowsHide: true,
        timeout: 60000, // 60s timeout
      });

      let stderr = '';

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('error', (err) => {
        resolve({
          success: false,
          bytesWritten: 0,
          error: `Failed to execute LibreOffice: ${err.message}`,
        });
      });

      child.on('close', async (code) => {
        if (code !== 0) {
          console.error('[LibreOffice] Process exited with code', code, 'stderr:', stderr);
          return resolve({
            success: false,
            bytesWritten: 0,
            error: `LibreOffice conversion exited with status ${code}.`,
          });
        }

        try {
          // LibreOffice creates a file with the input base name and target extension in outDir
          const inputBase = path.basename(inputPath, path.extname(inputPath));
          const generatedPath = path.join(outDir, `${inputBase}.${targetExt}`);

          if (fs.existsSync(generatedPath)) {
            if (path.resolve(generatedPath) !== path.resolve(outputPath)) {
              await fs.promises.rename(generatedPath, outputPath);
            }

            const stats = await fs.promises.stat(outputPath);
            if (stats.size > 0) {
              return resolve({
                success: true,
                bytesWritten: stats.size,
              });
            }
          }

          resolve({
            success: false,
            bytesWritten: 0,
            error: 'Output document was not created or is empty.',
          });
        } catch (err: any) {
          resolve({
            success: false,
            bytesWritten: 0,
            error: `Failed to verify LibreOffice output: ${err.message}`,
          });
        }
      });
    });
  }
}
