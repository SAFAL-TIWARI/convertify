import React, { useState } from 'react';
import { ChevronDown, RefreshCw, ArrowRight, FileText, Image as ImageIcon, FileCode, Check } from 'lucide-react';
import { FormatDefinition, ImageConversionOptions, JobStatus } from '../../../shared/types/index.js';
import { formatBytes, getFileExtension } from '../../lib/formatUtils.js';
import { ImageOptionsPanel } from './ImageOptionsPanel.js';
import { FormatSelectorModal } from '../format-selector/FormatSelectorModal.js';
import { GridCross } from '../common/TropicalMotif.js';

interface ConversionWorkspaceProps {
  file: File;
  selectedFormat: string;
  onFormatChange: (fmt: string) => void;
  onResetFile: () => void;
  onStartConvert: () => void;
  status: JobStatus;
  allFormats: Record<string, FormatDefinition>;
  allowedOutputs: string[];
  imageOptions: ImageConversionOptions;
  onImageOptionsChange: (opts: ImageConversionOptions) => void;
}

export const ConversionWorkspace: React.FC<ConversionWorkspaceProps> = ({
  file,
  selectedFormat,
  onFormatChange,
  onResetFile,
  onStartConvert,
  status,
  allFormats,
  allowedOutputs,
  imageOptions,
  onImageOptionsChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const inputExt = getFileExtension(file.name);
  const isImageConversion = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'].includes(
    inputExt
  );

  const isConverting = status === 'CONVERTING' || status === 'VERIFYING';

  return (
    <div className="w-full bg-white border-2 border-hh-black shadow-hh p-6 sm:p-10 space-y-8 animate-in fade-in">
      {/* Top technical banner */}
      <div className="flex items-center justify-between pb-4 border-b border-hh-black text-xs font-technical text-hh-muted">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-hh-green"></span>
          <span className="font-semibold text-hh-black uppercase tracking-wider">
            Active Conversion Pipeline
          </span>
        </div>
        <span>500 MB LOCAL LIMIT</span>
      </div>

      {/* Primary Transformation Stage: Source -> Direction -> Output */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center bg-hh-cream-light p-6 sm:p-8 border border-hh-black">
        {/* Left: Source File */}
        <div className="md:col-span-5 space-y-2">
          <div className="text-[11px] font-technical uppercase text-hh-muted">
            Source File
          </div>

          <div className="flex items-center gap-3 bg-white p-4 border border-hh-black shadow-hh-sm">
            <div className="w-12 h-12 bg-hh-cream border border-hh-black flex flex-col items-center justify-center font-technical flex-shrink-0">
              <span className="font-bold text-xs uppercase text-hh-green">
                .{inputExt}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-serif text-base font-bold text-hh-black truncate" title={file.name}>
                {file.name}
              </p>
              <div className="flex items-center gap-2 text-xs font-technical text-hh-muted mt-0.5">
                <span>{formatBytes(file.size)}</span>
                <span>•</span>
                <span className="uppercase text-hh-green font-medium">Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Conversion Direction */}
        <div className="md:col-span-1 flex items-center justify-center py-2 md:py-0">
          <div
            className={`w-10 h-10 rounded-full border border-hh-black bg-hh-cream flex items-center justify-center text-hh-black shadow-hh-sm ${
              isConverting ? 'animate-spin text-hh-pink' : ''
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </div>
        </div>

        {/* Right: Target Format */}
        <div className="md:col-span-5 space-y-2">
          <div className="text-[11px] font-technical uppercase text-hh-muted">
            Target Output Format
          </div>

          <button
            type="button"
            disabled={isConverting}
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-between bg-white hover:bg-hh-cream-light p-4 border border-hh-black shadow-hh-sm text-left transition-all active:translate-x-0.5 active:translate-y-0.5 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-hh-green text-hh-yellow border border-hh-black flex flex-col items-center justify-center font-technical flex-shrink-0">
                <span className="font-bold text-xs uppercase">
                  .{selectedFormat}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-base font-bold text-hh-black uppercase">
                    {selectedFormat}
                  </span>
                  <span className="text-[10px] font-technical px-1.5 py-0.5 bg-hh-cream text-hh-black border border-hh-border">
                    {allFormats[selectedFormat.toLowerCase()]?.name || 'Selected'}
                  </span>
                </div>
                <p className="text-xs font-technical text-hh-muted mt-0.5">
                  Click to switch format ({allowedOutputs.length} available)
                </p>
              </div>
            </div>

            <ChevronDown className="w-5 h-5 text-hh-black group-hover:text-hh-green transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* Optional image tuning controls if converting images */}
      {isImageConversion && (
        <ImageOptionsPanel
          options={imageOptions}
          onChange={onImageOptionsChange}
          isOpen={showImageOptions}
          onToggle={() => setShowImageOptions(!showImageOptions)}
        />
      )}

      {/* Conversion Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-hh-black">
        <button
          type="button"
          disabled={isConverting}
          onClick={onResetFile}
          className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-hh-cream text-hh-black font-serif text-sm font-semibold border border-hh-black shadow-hh-sm transition-all disabled:opacity-50"
        >
          Change File
        </button>

        <button
          type="button"
          disabled={isConverting || !selectedFormat}
          onClick={onStartConvert}
          className="w-full sm:w-auto px-8 py-3.5 bg-hh-green hover:bg-hh-deep-green text-white font-serif text-base font-bold border border-hh-black shadow-hh hover:shadow-hh-green flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60"
        >
          {isConverting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-hh-yellow" />
              <span>Processing File...</span>
            </>
          ) : (
            <>
              <span>Convert to {selectedFormat.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4 text-hh-yellow" />
            </>
          )}
        </button>
      </div>

      {/* Format Selector Modal */}
      <FormatSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectFormat={(fmt) => onFormatChange(fmt)}
        currentSelected={selectedFormat}
        allowedOutputs={allowedOutputs}
        allFormats={allFormats}
      />
    </div>
  );
};
