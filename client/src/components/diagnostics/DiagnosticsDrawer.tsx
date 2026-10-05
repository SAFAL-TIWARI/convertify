import React from 'react';
import { X, CheckCircle, AlertTriangle, Clock, RefreshCw, Terminal, ExternalLink } from 'lucide-react';
import { DiagnosticsResponse } from '@shared/types/index.js';

interface DiagnosticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostics: DiagnosticsResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const DiagnosticsDrawer: React.FC<DiagnosticsDrawerProps> = ({
  isOpen,
  onClose,
  diagnostics,
  isLoading,
  onRefresh,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagnostics-title"
    >
      <div
        className="w-full max-w-2xl bg-hh-cream border-2 border-hh-black shadow-hh overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="bg-hh-black text-hh-cream px-6 py-4 flex items-center justify-between border-b border-hh-black">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-hh-yellow" />
            <div>
              <h2 id="diagnostics-title" className="font-serif text-xl font-bold text-white tracking-tight">
                System Diagnostics & Engines
              </h2>
              <p className="text-xs font-technical text-hh-yellow/80 uppercase">
                Local host environment check
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              type="button"
              className="p-1.5 text-hh-cream hover:text-white hover:bg-white/10 transition-colors"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-hh-cream hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Host info strip */}
          <div className="p-3 bg-white border border-hh-black font-technical text-xs flex flex-wrap items-center justify-between gap-3 shadow-hh-sm">
            <div>
              <span className="text-hh-muted">Node.js: </span>
              <strong className="text-hh-black">{diagnostics?.nodeVersion || 'Detecting...'}</strong>
            </div>
            <div>
              <span className="text-hh-muted">Platform: </span>
              <strong className="text-hh-black uppercase">{diagnostics?.platform || process.platform}</strong>
            </div>
            <div>
              <span className="text-hh-muted">Max File Size: </span>
              <strong className="text-hh-green">500 MB</strong>
            </div>
          </div>

          {/* Engine Cards */}
          <div className="space-y-4">
            <div className="text-xs font-technical uppercase text-hh-green tracking-wider font-semibold">
              // Conversion Engine Status
            </div>

            {/* 1. Sharp Engine */}
            <div className="p-4 bg-white border border-hh-black shadow-hh-sm space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-hh-black">
                    Image Processing Engine (Sharp / libvips)
                  </h4>
                  <p className="text-xs text-hh-muted">
                    Handles JPG, PNG, WEBP, AVIF, TIFF, GIF conversions locally.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-hh-green text-white font-technical text-xs font-semibold uppercase">
                  <CheckCircle className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
              <div className="text-[11px] font-technical text-hh-muted pt-1">
                Formats: JPG, PNG, WEBP, AVIF, TIFF, GIF • Quality tuning, resize, aspect lock
              </div>
            </div>

            {/* 2. Native Node Document Engine */}
            <div className="p-4 bg-white border border-hh-black shadow-hh-sm space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-hh-black">
                    Native Node Document Engine
                  </h4>
                  <p className="text-xs text-hh-muted">
                    PDF-Lib, Mammoth, Docx, and SheetJS integrated directly in Node.js.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-hh-green text-white font-technical text-xs font-semibold uppercase">
                  <CheckCircle className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
              <div className="text-[11px] font-technical text-hh-muted pt-1">
                Formats: PDF ↔ TXT, TXT ↔ DOCX, DOCX ↔ HTML/MD, XLSX ↔ CSV/HTML/JSON
              </div>
            </div>

            {/* 3. LibreOffice Headless */}
            <div className="p-4 bg-white border border-hh-black shadow-hh-sm space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-hh-black">
                    LibreOffice Headless Suite
                  </h4>
                  <p className="text-xs text-hh-muted">
                    Unlocks legacy binary formats (DOC, PPT, PPTX, ODT, RTF).
                  </p>
                </div>
                {diagnostics?.engines.libreOffice.status === 'READY' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-hh-green text-white font-technical text-xs font-semibold uppercase">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-400 font-technical text-xs font-semibold uppercase">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Optional / Not Installed
                  </span>
                )}
              </div>
              <p className="text-xs text-hh-black/80 font-technical pt-1">
                {diagnostics?.engines.libreOffice.description ||
                  'External suite. Install LibreOffice to enable legacy Word/PowerPoint conversions.'}
              </p>
              {diagnostics?.engines.libreOffice.status !== 'READY' && (
                <div className="p-2.5 bg-hh-cream border border-hh-border text-[11px] font-technical text-hh-black space-y-1">
                  <div><strong>To install LibreOffice on Windows:</strong></div>
                  <div className="bg-white p-1.5 border border-hh-border font-mono text-hh-pink">
                    winget install TheDocumentFoundation.LibreOffice
                  </div>
                  <div className="text-hh-muted">
                    Native document conversion (TXT, PDF, DOCX, XLSX, CSV) remains fully functional without it.
                  </div>
                </div>
              )}
            </div>

            {/* 4. Future FFmpeg Engine */}
            <div className="p-4 bg-hh-cream-dark/40 border border-hh-black border-dashed space-y-2 opacity-80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-hh-black">
                    Media Transcoding Engine (FFmpeg Architecture)
                  </h4>
                  <p className="text-xs text-hh-muted">
                    Audio / video conversion pipelines.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-hh-cream border border-hh-black text-hh-muted font-technical text-xs uppercase">
                  <Clock className="w-3.5 h-3.5" /> Coming Soon
                </span>
              </div>
              <div className="text-[11px] font-technical text-hh-muted">
                Controls remain intentionally disabled per current development scope.
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-hh-cream-light border-t border-hh-black flex items-center justify-between text-xs font-technical text-hh-muted">
          <span>Local workstation verification</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-hh-black text-white hover:bg-hh-deep-green font-semibold shadow-hh-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
