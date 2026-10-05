import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  ConversionJobResult,
  JobStatus,
  ImageConversionOptions,
} from '../../../shared/types/index.js';
import { CONFIG } from '../../config.js';
import { generateOutputFilename, sanitizeFilename } from '../../utils/sanitize.js';
import { safeUnlink } from '../../utils/tempDir.js';
import { engineRegistry } from '../engineRegistry.js';

interface InternalJobRecord {
  jobId: string;
  status: JobStatus;
  stageMessage: string;
  createdAt: number;
  completedAt?: number;
  input: {
    originalName: string;
    format: string;
    size: number;
    mimeType: string;
    filePath: string;
  };
  output?: {
    filename: string;
    format: string;
    size: number;
    mimeType: string;
    filePath: string;
    downloadUrl: string;
    previewUrl?: string;
    textPreview?: string;
  };
  error?: string;
}

export class JobManager {
  private jobs: Map<string, InternalJobRecord> = new Map();

  constructor() {
    // Run periodic cleanup for expired jobs
    setInterval(() => {
      this.cleanupExpiredJobs();
    }, CONFIG.CLEANUP_INTERVAL_MS);
  }

  getJob(jobId: string): ConversionJobResult | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;
    return this.toPublicResult(job);
  }

  getInternalJob(jobId: string): InternalJobRecord | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Creates and executes a conversion job
   */
  async createAndExecuteJob(params: {
    inputFilePath: string;
    originalFilename: string;
    inputFormat: string;
    targetFormat: string;
    fileSizeBytes: number;
    mimeType: string;
    options?: ImageConversionOptions;
  }): Promise<ConversionJobResult> {
    const jobId = uuidv4();
    const cleanTargetExt = params.targetFormat.toLowerCase().replace(/^\./, '');
    const cleanInputExt = params.inputFormat.toLowerCase().replace(/^\./, '');

    const outputFilename = generateOutputFilename(params.originalFilename, cleanTargetExt);
    const outputFilePath = path.join(CONFIG.OUTPUTS_DIR, `${jobId}-${outputFilename}`);

    const record: InternalJobRecord = {
      jobId,
      status: 'CONVERTING',
      stageMessage: 'Preparing conversion engine...',
      createdAt: Date.now(),
      input: {
        originalName: sanitizeFilename(params.originalFilename),
        format: cleanInputExt,
        size: params.fileSizeBytes,
        mimeType: params.mimeType,
        filePath: params.inputFilePath,
      },
    };

    this.jobs.set(jobId, record);

    // Find suitable engine
    const engine = engineRegistry.findEngine(cleanInputExt, cleanTargetExt);
    if (!engine) {
      record.status = 'FAILED';
      record.error = "We can read this file, but we don't currently support that conversion.";
      record.stageMessage = 'Unsupported conversion format pair.';
      record.completedAt = Date.now();
      await safeUnlink(params.inputFilePath);
      return this.toPublicResult(record);
    }

    try {
      record.stageMessage = `Converting using ${engine.name}...`;

      const result = await engine.convert(
        params.inputFilePath,
        outputFilePath,
        cleanInputExt,
        cleanTargetExt,
        params.options
      );

      if (!result.success) {
        record.status = 'FAILED';
        record.error = result.error || 'Something went wrong while converting this file.';
        record.stageMessage = 'Conversion execution failed.';
        record.completedAt = Date.now();
        await safeUnlink(params.inputFilePath);
        await safeUnlink(outputFilePath);
        return this.toPublicResult(record);
      }

      // Stage: Verifying output
      record.status = 'VERIFYING';
      record.stageMessage = 'Verifying output integrity...';

      if (!fs.existsSync(outputFilePath)) {
        record.status = 'FAILED';
        record.error = 'The conversion finished, but the generated file could not be verified.';
        record.completedAt = Date.now();
        await safeUnlink(params.inputFilePath);
        return this.toPublicResult(record);
      }

      const outStats = await fs.promises.stat(outputFilePath);
      if (outStats.size === 0) {
        record.status = 'FAILED';
        record.error = 'The conversion generated an empty output file.';
        record.completedAt = Date.now();
        await safeUnlink(params.inputFilePath);
        await safeUnlink(outputFilePath);
        return this.toPublicResult(record);
      }

      // Determine output MIME
      const outMime = this.getMimeForExtension(cleanTargetExt);

      // Extract lightweight preview snippet if text/document
      let textSnippet: string | undefined;
      const textLikeFormats = ['txt', 'md', 'html', 'json', 'csv'];
      if (textLikeFormats.includes(cleanTargetExt)) {
        try {
          const slice = await fs.promises.readFile(outputFilePath, 'utf8');
          textSnippet = slice.slice(0, 1500);
        } catch {
          // ignore
        }
      }

      record.status = 'COMPLETED';
      record.stageMessage = 'Ready';
      record.completedAt = Date.now();
      record.output = {
        filename: outputFilename,
        format: cleanTargetExt,
        size: outStats.size,
        mimeType: outMime,
        filePath: outputFilePath,
        downloadUrl: `/api/download/${jobId}`,
        previewUrl: `/api/preview/${jobId}`,
        textPreview: textSnippet,
      };

      // Clean up input file now that conversion is completed successfully
      await safeUnlink(params.inputFilePath);

      return this.toPublicResult(record);
    } catch (err: any) {
      console.error(`[JobManager] Job ${jobId} failed with exception:`, err);
      record.status = 'FAILED';
      record.error = 'Something went wrong while converting this file. The original file was not changed.';
      record.stageMessage = 'Conversion encountered an unexpected error.';
      record.completedAt = Date.now();

      await safeUnlink(params.inputFilePath);
      await safeUnlink(outputFilePath);

      return this.toPublicResult(record);
    }
  }

  private getMimeForExtension(ext: string): string {
    const map: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      txt: 'text/plain',
      md: 'text/markdown',
      html: 'text/html',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      csv: 'text/csv',
      json: 'application/json',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      tiff: 'image/tiff',
      avif: 'image/avif',
    };
    return map[ext.toLowerCase()] || 'application/octet-stream';
  }

  private toPublicResult(record: InternalJobRecord): ConversionJobResult {
    return {
      jobId: record.jobId,
      status: record.status,
      stageMessage: record.stageMessage,
      createdAt: record.createdAt,
      completedAt: record.completedAt,
      input: {
        originalName: record.input.originalName,
        format: record.input.format,
        size: record.input.size,
        mimeType: record.input.mimeType,
      },
      output: record.output
        ? {
            filename: record.output.filename,
            format: record.output.format,
            size: record.output.size,
            mimeType: record.output.mimeType,
            downloadUrl: record.output.downloadUrl,
            previewUrl: record.output.previewUrl,
            textPreview: record.output.textPreview,
          }
        : undefined,
      error: record.error,
    };
  }

  private async cleanupExpiredJobs(): Promise<void> {
    const now = Date.now();
    for (const [jobId, job] of this.jobs.entries()) {
      if (now - job.createdAt > CONFIG.JOB_EXPIRATION_MS) {
        if (job.output?.filePath) {
          await safeUnlink(job.output.filePath);
        }
        if (job.input.filePath) {
          await safeUnlink(job.input.filePath);
        }
        this.jobs.delete(jobId);
      }
    }
  }
}

export const jobManager = new JobManager();
