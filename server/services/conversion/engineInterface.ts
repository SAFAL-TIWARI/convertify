export interface ConversionResult {
  success: boolean;
  bytesWritten: number;
  error?: string;
  stageMessage?: string;
}

export interface EngineConversionOptions {
  quality?: number;
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside';
  preserveAspectRatio?: boolean;
}

export interface ConversionEngine {
  readonly name: string;
  isAvailable(): Promise<boolean> | boolean;
  canConvert(inputFormat: string, outputFormat: string): boolean;
  convert(
    inputPath: string,
    outputPath: string,
    inputFormat: string,
    outputFormat: string,
    options?: EngineConversionOptions
  ): Promise<ConversionResult>;
}
