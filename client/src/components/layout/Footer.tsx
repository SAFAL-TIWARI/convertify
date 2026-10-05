import React from 'react';
import { WaveMotif, PalmIcon, GridCross } from '../common/TropicalMotif.js';
import { ShieldCheck, HardDrive, Cpu, Terminal } from 'lucide-react';

export const Footer: React.FC<{ onOpenDiagnostics: () => void }> = ({ onOpenDiagnostics }) => {
  return (
    <footer className="relative bg-hh-black text-hh-cream border-t-2 border-hh-black mt-20">
      {/* Editorial technical strip */}
      <div className="border-b border-hh-cream/15 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-xs font-technical text-hh-yellow tracking-widest uppercase">
              // ARCHITECTURAL NOTES
            </span>
            <WaveMotif className="w-16 h-3 text-hh-green" />
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl text-hh-cream-light font-normal max-w-2xl mb-8 leading-snug">
            Built for practical conversion, not complicated workflows.
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-hh-cream/15 bg-white/5 space-y-2">
              <div className="flex items-center gap-2 text-hh-yellow font-technical text-xs uppercase">
                <HardDrive className="w-4 h-4" /> Local Processing
              </div>
              <p className="text-xs text-hh-cream/75 leading-relaxed">
                Files are streamed directly to your local Node instance running on port 3001. No external cloud conversion APIs receive your data.
              </p>
            </div>

            <div className="p-4 border border-hh-cream/15 bg-white/5 space-y-2">
              <div className="flex items-center gap-2 text-hh-yellow font-technical text-xs uppercase">
                <ShieldCheck className="w-4 h-4" /> 500 MB Limit & Cleanups
              </div>
              <p className="text-xs text-hh-cream/75 leading-relaxed">
                Generous 500 MB capacity. Temporary isolated files are automatically purged after conversion and upon service restart.
              </p>
            </div>

            <div className="p-4 border border-hh-cream/15 bg-white/5 space-y-2">
              <div className="flex items-center gap-2 text-hh-yellow font-technical text-xs uppercase">
                <Cpu className="w-4 h-4" /> Open Engines
              </div>
              <p className="text-xs text-hh-cream/75 leading-relaxed">
                Powered by Sharp (libvips), PDF-Lib, Mammoth, SheetJS, and headless LibreOffice. Pure Node and safe local processes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer links and brand */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-hh-cream/15">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                CONVERTIFY
              </span>
              <span className="w-2 h-2 rounded-full bg-hh-pink"></span>
            </div>
            <p className="text-xs font-technical text-hh-cream/70 tracking-wider uppercase">
              Less noise. More signal. Just convert.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-technical text-hh-cream/80">
            <a href="#converter" className="hover:text-hh-yellow transition-colors">
              Converter
            </a>
            <a href="#tools" className="hover:text-hh-yellow transition-colors">
              Tools
            </a>
            <a href="#formats" className="hover:text-hh-yellow transition-colors">
              Formats
            </a>
            <button
              onClick={onOpenDiagnostics}
              type="button"
              className="hover:text-hh-yellow transition-colors text-left"
            >
              Diagnostics
            </button>
            <a href="#privacy" className="hover:text-hh-yellow transition-colors">
              Privacy
            </a>
          </div>
        </div>

        {/* Disclaimer & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-hh-cream/50">
          <p className="max-w-xl leading-relaxed">
            An independent builder project inspired by the Hacker House Goa 2026 visual language. Not an official Hacker House Goa product. No cookies, no tracking scripts, no third-party account required.
          </p>
          <div className="flex items-center gap-2 font-technical text-hh-cream/60">
            <PalmIcon className="w-4 h-4 text-hh-green" />
            <span>Goa Builders • 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
