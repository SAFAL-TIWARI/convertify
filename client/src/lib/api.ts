import {
  DiagnosticsResponse,
  FormatDefinition,
  ConversionPair,
  FileCategory,
  ConversionJobResult,
  ImageConversionOptions,
} from '../../../shared/types/index.js';

export interface CatalogResponse {
  activeCategories: FileCategory[];
  inactiveCategories: FileCategory[];
  formats: Record<string, FormatDefinition>;
  popularPairs: ConversionPair[];
}

export async function fetchFormatsCatalog(): Promise<CatalogResponse> {
  const res = await fetch('/api/formats');
  if (!res.ok) throw new Error('Failed to load format capabilities from local engine');
  const data = await res.json();
  return data.catalog;
}

export async function fetchDiagnostics(): Promise<DiagnosticsResponse> {
  const res = await fetch('/api/diagnostics');
  if (!res.ok) throw new Error('Failed to load local system diagnostics');
  const data = await res.json();
  return data.diagnostics;
}

export async function uploadAndConvert(
  file: File,
  targetFormat: string,
  options?: ImageConversionOptions
): Promise<ConversionJobResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetFormat', targetFormat);
  if (options) {
    formData.append('options', JSON.stringify(options));
  }

  const res = await fetch('/api/convert', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Conversion failed.');
  }

  return data;
}

export async function pollJob(jobId: string): Promise<ConversionJobResult> {
  const res = await fetch(`/api/jobs/${jobId}`);
  if (!res.ok) throw new Error('Job not found or expired.');
  const data = await res.json();
  return data.job;
}
