import React from 'react';
import { Download, RefreshCw, ArrowRight, FileCheck, CheckCircle2 } from 'lucide-react';
import { ConversionJobResult } from '@shared/types/index.js';
import { formatBytes } from '../../lib/formatUtils.js';
import { FilePreview } from './FilePreview.js';

interface ResultCardProps {
  job: ConversionJobResult;
  onConvertAnother: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ job, onConvertAnother }) => {
  const { input, output } = job;

  if (!output) return null;

  // Calculate size change percentage if applicable
  const sizeDiff = output.size - input.size;
  const pctChange = Math.round((sizeDiff / input.size) * 100);

  return (
    <div className="w-full bg-white border-2 border-hh-black shadow-hh p-6 sm:p-8 space-y-6 animate-in fade-in">
      {/* Header status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hh-black">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-hh-green text-hh-yellow border border-hh-black shadow-hh-sm flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-hh-black">
              Nice. Conversion complete.
            </h2>
            <p className="text-xs font-technical text-hh-muted">
              Generated locally and verified on your machine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-hh-cream border border-hh-black text-xs font-technical text-hh-black font-semibold uppercase">
            .{output.format}
          </span>
          <span className="px-2.5 py-1 bg-hh-green text-white border border-hh-black text-xs font-technical uppercase">
            {formatBytes(output.size)}
          </span>
        </div>
      </div>

      {/* File transformation card */}
      <div className="p-4 bg-hh-cream-light border border-hh-black grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Source file */}
        <div className="space-y-1">
          <span className="text-[10px] font-technical uppercase text-hh-muted">
            Source File
          </span>
          <p className="font-serif text-sm font-bold text-hh-black truncate" title={input.originalName}>
            {input.originalName}
          </p>
          <div className="flex items-center gap-2 text-[11px] font-technical text-hh-muted">
            <span className="uppercase font-semibold">.{input.format}</span>
            <span>•</span>
            <span>{formatBytes(input.size)}</span>
          </div>
        </div>

        {/* Transformation marker */}
        <div className="flex items-center justify-center gap-2 py-2 md:py-0 text-hh-green font-technical text-xs border-y md:border-y-0 md:border-x border-hh-border">
          <span>Converted to</span>
          <ArrowRight className="w-4 h-4 text-hh-pink" />
          <span className="font-bold uppercase">.{output.format}</span>
          {pctChange !== 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.5 border ${
                pctChange < 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}
            >
              {pctChange < 0 ? `${pctChange}%` : `+${pctChange}%`}
            </span>
          )}
        </div>

        {/* Converted file */}
        <div className="space-y-1 md:text-right">
          <span className="text-[10px] font-technical uppercase text-hh-muted">
            Output File
          </span>
          <p className="font-serif text-sm font-bold text-hh-black truncate" title={output.filename}>
            {output.filename}
          </p>
          <div className="flex items-center md:justify-end gap-2 text-[11px] font-technical text-hh-muted">
            <span className="uppercase font-semibold text-hh-green">.{output.format}</span>
            <span>•</span>
            <span className="font-medium text-hh-black">{formatBytes(output.size)}</span>
          </div>
        </div>
      </div>

      {/* Lightweight Preview (Image, PDF, or Text Snippet) */}
      <FilePreview
        format={output.format}
        previewUrl={output.previewUrl}
        textPreview={output.textPreview}
        filename={output.filename}
      />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <a
          href={output.downloadUrl}
          download={output.filename}
          className="w-full sm:flex-1 py-3 px-6 bg-hh-pink hover:bg-[#d90d6b] text-white font-serif text-base font-bold border border-hh-black shadow-hh hover:shadow-hh-pink flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 text-center"
        >
          <Download className="w-5 h-5 text-hh-yellow" />
          Download {output.filename}
        </a>

        <button
          type="button"
          onClick={onConvertAnother}
          className="w-full sm:w-auto py-3 px-5 bg-white hover:bg-hh-cream-light text-hh-black font-serif text-sm font-semibold border border-hh-black shadow-hh-sm flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          <RefreshCw className="w-4 h-4 text-hh-green" />
          Convert Another
        </button>
      </div>

      {/* Privacy note */}
      <p className="text-[11px] font-technical text-hh-muted text-center pt-2">
        Temporary files are automatically discarded. No copy is stored on external cloud servers.
      </p>
    </div>
  );
};
