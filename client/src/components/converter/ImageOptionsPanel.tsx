import React from 'react';
import { Sliders, Lock, Unlock } from 'lucide-react';
import { ImageConversionOptions } from '@shared/types/index.js';

interface ImageOptionsPanelProps {
  options: ImageConversionOptions;
  onChange: (options: ImageConversionOptions) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ImageOptionsPanel: React.FC<ImageOptionsPanelProps> = ({
  options,
  onChange,
  isOpen,
  onToggle,
}) => {
  const quality = options.quality ?? 85;
  const preserveRatio = options.preserveAspectRatio ?? true;

  const handleQualityChange = (val: number) => {
    onChange({ ...options, quality: val });
  };

  const handleWidthChange = (val: string) => {
    const num = parseInt(val, 10);
    onChange({ ...options, width: isNaN(num) || num <= 0 ? undefined : num });
  };

  const handleHeightChange = (val: string) => {
    const num = parseInt(val, 10);
    onChange({ ...options, height: isNaN(num) || num <= 0 ? undefined : num });
  };

  const handleFitChange = (fit: 'cover' | 'contain' | 'inside' | 'fill') => {
    onChange({ ...options, fit });
  };

  const toggleAspectRatio = () => {
    onChange({ ...options, preserveAspectRatio: !preserveRatio });
  };

  return (
    <div className="border border-hh-border bg-hh-cream-light/60 text-xs">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-2.5 flex items-center justify-between text-hh-black hover:bg-white/80 transition-colors font-technical"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-hh-green" />
          <span className="font-semibold uppercase tracking-wider">Image Tuning (Optional)</span>
          {(options.quality || options.width || options.height) && (
            <span className="w-2 h-2 rounded-full bg-hh-pink" />
          )}
        </div>
        <span className="text-[11px] text-hh-muted">
          {isOpen ? 'Collapse [-]' : 'Expand [+]'}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-hh-border space-y-4 font-technical bg-white/70">
          {/* Quality Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="image-quality-slider" className="text-[11px] text-hh-black font-medium uppercase">
                Compression Quality
              </label>
              <span className="text-xs font-bold text-hh-green">{quality}%</span>
            </div>
            <input
              id="image-quality-slider"
              type="range"
              min="10"
              max="100"
              step="5"
              value={quality}
              onChange={(e) => handleQualityChange(parseInt(e.target.value, 10))}
              className="w-full accent-hh-green cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-hh-muted mt-1">
              <span>Smaller Size</span>
              <span>Balanced (85%)</span>
              <span>Maximum Quality</span>
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label htmlFor="image-width-input" className="block text-[11px] text-hh-black font-medium uppercase mb-1">
                Max Width (px)
              </label>
              <input
                id="image-width-input"
                type="number"
                placeholder="Original"
                value={options.width || ''}
                onChange={(e) => handleWidthChange(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-hh-black text-xs font-technical focus:outline-none focus:ring-1 focus:ring-hh-green"
              />
            </div>

            <div>
              <label htmlFor="image-height-input" className="block text-[11px] text-hh-black font-medium uppercase mb-1">
                Max Height (px)
              </label>
              <input
                id="image-height-input"
                type="number"
                placeholder="Original"
                value={options.height || ''}
                onChange={(e) => handleHeightChange(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-hh-black text-xs font-technical focus:outline-none focus:ring-1 focus:ring-hh-green"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAspectRatio}
                className={`flex-1 px-2.5 py-1.5 border border-hh-black flex items-center justify-center gap-1.5 text-xs transition-colors ${
                  preserveRatio
                    ? 'bg-hh-green text-white font-medium'
                    : 'bg-white hover:bg-hh-cream text-hh-black'
                }`}
                title="Preserve Aspect Ratio"
              >
                {preserveRatio ? <Lock className="w-3 h-3 text-hh-yellow" /> : <Unlock className="w-3 h-3 text-hh-muted" />}
                <span>{preserveRatio ? 'Ratio Locked' : 'Ratio Free'}</span>
              </button>
            </div>
          </div>

          {/* Fit Mode */}
          {(options.width || options.height) && (
            <div>
              <label className="block text-[11px] text-hh-black font-medium uppercase mb-1.5">
                Fit Algorithm
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['inside', 'cover', 'contain', 'fill'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleFitChange(mode)}
                    className={`py-1 text-center border text-[11px] uppercase transition-colors ${
                      (options.fit || 'inside') === mode
                        ? 'bg-hh-deep-green text-white border-hh-black font-semibold'
                        : 'bg-white hover:bg-hh-cream border-hh-border text-hh-black'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
