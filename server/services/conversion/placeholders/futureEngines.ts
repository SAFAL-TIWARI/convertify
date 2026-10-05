import { ConversionEngine, ConversionResult } from '../engineInterface.js';

export class AudioEnginePlaceholder implements ConversionEngine {
  readonly name = 'Audio Engine (FFmpeg Architecture Placeholder)';

  isAvailable(): boolean {
    return false; // Intentionally disabled in current scope
  }

  canConvert(): boolean {
    return false; // Inactive
  }

  async convert(): Promise<ConversionResult> {
    return {
      success: false,
      bytesWritten: 0,
      error: 'Audio conversion is currently in development and planned for future release.',
    };
  }
}

export class VideoEnginePlaceholder implements ConversionEngine {
  readonly name = 'Video Engine (FFmpeg Architecture Placeholder)';

  isAvailable(): boolean {
    return false; // Intentionally disabled in current scope
  }

  canConvert(): boolean {
    return false; // Inactive
  }

  async convert(): Promise<ConversionResult> {
    return {
      success: false,
      bytesWritten: 0,
      error: 'Video conversion is currently in development and planned for future release.',
    };
  }
}

export class ArchiveEnginePlaceholder implements ConversionEngine {
  readonly name = 'Archive Engine (Architecture Placeholder)';

  isAvailable(): boolean {
    return false; // Intentionally disabled
  }

  canConvert(): boolean {
    return false; // Inactive
  }

  async convert(): Promise<ConversionResult> {
    return {
      success: false,
      bytesWritten: 0,
      error: 'Archive conversion is currently in development and planned for future release.',
    };
  }
}
