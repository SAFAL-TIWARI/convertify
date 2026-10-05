export type FileCategory =
  | 'document'
  | 'image'
  | 'audio'
  | 'video'
  | 'archive'
  | 'ebook'
  | 'spreadsheet'
  | 'presentation'
  | 'cad'
  | 'font'
  | 'vector'
  | 'other';

export type JobStatus =
  | 'IDLE'
  | 'FILE_SELECTED'
  | 'READY_TO_CONVERT'
  | 'CONVERTING'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED';

export interface FormatDefinition {
  ext: string;
  name: string;
  category: FileCategory;
  mimeType: string;
  isActive: boolean; // true if currently supported, false if 'coming_soon'
  outputs: string[]; // List of extensions this can be converted into
  inputs?: string[];  // List of extensions that can convert into this
  description?: string;
  badge?: string;
}

export interface ImageConversionOptions {
  quality?: number; // 1 to 100
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside';
  preserveAspectRatio?: boolean;
}

export interface ConversionJobResult {
  jobId: string;
  status: JobStatus;
  stageMessage?: string;
  createdAt: number;
  completedAt?: number;
  input: {
    originalName: string;
    format: string;
    size: number;
    mimeType: string;
  };
  output?: {
    filename: string;
    format: string;
    size: number;
    mimeType: string;
    downloadUrl: string;
    previewUrl?: string;
    textPreview?: string;
  };
  error?: string;
}

export interface EngineStatus {
  name: string;
  version?: string;
  status: 'READY' | 'NOT_INSTALLED' | 'COMING_SOON';
  description: string;
  requiredFor: string[];
}

export interface DiagnosticsResponse {
  nodeVersion: string;
  platform: string;
  engines: {
    sharp: EngineStatus;
    libreOffice: EngineStatus;
    nodeDocument: EngineStatus;
    ffmpeg: EngineStatus;
  };
  limits: {
    maxFileSizeBytes: number;
    maxFileSizeMb: number;
  };
}

export interface ConversionPair {
  from: string;
  to: string;
  label: string;
  category: FileCategory;
  description: string;
}
