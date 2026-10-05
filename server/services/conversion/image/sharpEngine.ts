import fs from 'fs';
import sharp from 'sharp';
import { ConversionEngine, ConversionResult, EngineConversionOptions } from '../engineInterface.js';

export class SharpImageEngine implements ConversionEngine {
  readonly name = 'Sharp Image Engine';

  private supportedFormats = new Set([
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
    'tiff',
    'avif',
    'bmp',
  ]);

  private outputFormats = new Set([
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
    'tiff',
    'avif',
  ]);

  isAvailable(): boolean {
    return true; // Sharp is bundled and verified
  }

  canConvert(inputFormat: string, outputFormat: string): boolean {
    const normInput = inputFormat.toLowerCase().replace(/^\./, '');
    const normOutput = outputFormat.toLowerCase().replace(/^\./, '');

    return (
      this.supportedFormats.has(normInput) &&
      this.outputFormats.has(normOutput) &&
      normInput !== normOutput
    );
  }

  async convert(
    inputPath: string,
    outputPath: string,
    inputFormat: string,
    outputFormat: string,
    options?: EngineConversionOptions
  ): Promise<ConversionResult> {
    try {
      const normOutput = outputFormat.toLowerCase().replace(/^\./, '');
      let pipeline = sharp(inputPath, {
        animated: normOutput === 'webp' || normOutput === 'gif',
      });

      // Automatically orient based on EXIF
      pipeline = pipeline.rotate();

      // Handle resize if options specified
      if (options?.width || options?.height) {
        pipeline = pipeline.resize({
          width: options.width,
          height: options.height,
          fit: options.fit || (options.preserveAspectRatio ? 'inside' : 'cover'),
          withoutEnlargement: true,
        });
      }

      const quality = options?.quality ? Math.min(100, Math.max(1, options.quality)) : undefined;

      switch (normOutput) {
        case 'jpg':
        case 'jpeg':
          // Flatten transparent background to white for JPEGs
          pipeline = pipeline
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .jpeg({ quality: quality || 85, mozjpeg: true });
          break;

        case 'png':
          pipeline = pipeline.png({
            compressionLevel: 9,
            quality: quality || 100,
          });
          break;

        case 'webp':
          pipeline = pipeline.webp({
            quality: quality || 85,
            effort: 4,
          });
          break;

        case 'avif':
          pipeline = pipeline.avif({
            quality: quality || 75,
            effort: 4,
          });
          break;

        case 'tiff':
          pipeline = pipeline.tiff({
            quality: quality || 85,
            compression: 'deflate',
          });
          break;

        case 'gif':
          pipeline = pipeline.gif();
          break;

        default:
          return {
            success: false,
            bytesWritten: 0,
            error: `Unsupported image output format: ${normOutput}`,
          };
      }

      await pipeline.toFile(outputPath);

      const stats = await fs.promises.stat(outputPath);
      if (stats.size === 0) {
        return {
          success: false,
          bytesWritten: 0,
          error: 'Conversion generated an empty output file.',
        };
      }

      return {
        success: true,
        bytesWritten: stats.size,
      };
    } catch (err: any) {
      console.error('[SharpImageEngine] Conversion error:', err);
      return {
        success: false,
        bytesWritten: 0,
        error: err?.message || 'Image conversion failed during processing.',
      };
    }
  }
}
