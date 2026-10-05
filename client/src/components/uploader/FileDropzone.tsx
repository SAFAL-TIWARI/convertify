import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileUp, AlertTriangle } from 'lucide-react';
import { PalmIcon, WaveMotif, GridCross } from '../common/TropicalMotif.js';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  maxSizeMb?: number;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  maxSizeMb = 500,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  const handleValidateAndSelect = (file: File) => {
    setErrorMessage(null);

    if (file.size === 0) {
      setErrorMessage('The selected file is empty (0 bytes).');
      return;
    }

    if (file.size > maxSizeBytes) {
      setErrorMessage(
        `That file is larger than ${maxSizeMb} MB. Please choose a smaller file.`
      );
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleValidateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleValidateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed p-8 sm:p-14 text-center transition-all ${
          isDragOver
            ? 'border-hh-pink bg-hh-pink/5 scale-[1.008]'
            : 'border-hh-black bg-hh-cream-light hover:bg-white hover:border-hh-green shadow-hh'
        }`}
      >
        {/* Corner technical crosshairs */}
        <div className="absolute top-2 left-2 pointer-events-none">
          <GridCross />
        </div>
        <div className="absolute top-2 right-2 pointer-events-none">
          <GridCross />
        </div>
        <div className="absolute bottom-2 left-2 pointer-events-none">
          <GridCross />
        </div>
        <div className="absolute bottom-2 right-2 pointer-events-none">
          <GridCross />
        </div>

        {/* Hidden native input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
          aria-label="Upload file to convert"
        />

        <div className="max-w-md mx-auto space-y-4">
          {/* Visual motif icon */}
          <div className="w-16 h-16 mx-auto bg-hh-cream border border-hh-black shadow-hh-sm flex items-center justify-center transition-transform group-hover:-translate-y-1">
            <UploadCloud className="w-8 h-8 text-hh-green transition-colors group-hover:text-hh-pink" />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-hh-black tracking-tight">
              Drop a file. Let's make it something else.
            </h2>
            <p className="text-xs sm:text-sm text-hh-muted leading-relaxed">
              Documents and images are live. Files stay on your machine.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 bg-hh-green hover:bg-hh-deep-green text-white font-serif text-base font-semibold border border-hh-black shadow-hh hover:shadow-hh-green transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <FileUp className="w-4 h-4 text-hh-yellow" />
              Choose File
            </button>
          </div>

          {/* Technical Specs Metadata */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] font-technical text-hh-muted">
            <span className="px-2 py-0.5 bg-hh-cream border border-hh-border">
              MAX 500 MB
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 bg-hh-cream border border-hh-border">
              PDF, DOCX, XLSX, TXT, MD
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 bg-hh-cream border border-hh-border">
              JPG, PNG, WEBP, AVIF, TIFF
            </span>
          </div>
        </div>
      </div>

      {/* Error notification if file oversized or empty */}
      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-500 text-red-900 text-xs font-technical flex items-start gap-2.5 shadow-hh-sm animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">File Rejected:</strong> {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
};
