import React from 'react';
import { PalmIcon, GridCross } from '../common/TropicalMotif.js';
import { Activity, Cpu } from 'lucide-react';

interface HeaderProps {
  onOpenDiagnostics: () => void;
  engineStatusText?: string;
  isEngineReady?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDiagnostics,
  engineStatusText = 'Local Node Ready',
  isEngineReady = true,
}) => {
  return (
    <header className="relative bg-hh-cream border-b border-hh-black">
      {/* Top subtle grid markers */}
      <div className="absolute top-2 left-3 pointer-events-none">
        <GridCross />
      </div>
      <div className="absolute top-2 right-3 pointer-events-none">
        <GridCross />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <a href="#" className="group flex items-center gap-2.5">
            <div className="w-10 h-10 bg-hh-green text-hh-yellow border border-hh-black shadow-hh-sm flex items-center justify-center transition-transform group-hover:-translate-y-0.5">
              <PalmIcon className="w-5 h-5 text-hh-yellow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-2xl font-bold tracking-tight text-hh-black">
                  Convertify
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-hh-pink"></span>
              </div>
              <p className="text-[11px] font-technical text-hh-muted uppercase tracking-wider">
                Less noise, more signal
              </p>
            </div>
          </a>
        </div>

        {/* Center / Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a
            href="#converter"
            className="text-hh-black hover:text-hh-green transition-colors pb-0.5 border-b-2 border-transparent hover:border-hh-green"
          >
            Converter
          </a>
          <a
            href="#tools"
            className="text-hh-black hover:text-hh-green transition-colors pb-0.5 border-b-2 border-transparent hover:border-hh-green"
          >
            Tools
          </a>
          <a
            href="#formats"
            className="text-hh-black hover:text-hh-green transition-colors pb-0.5 border-b-2 border-transparent hover:border-hh-green"
          >
            Format Catalog
          </a>
          <a
            href="#how-it-works"
            className="text-hh-black hover:text-hh-green transition-colors pb-0.5 border-b-2 border-transparent hover:border-hh-green"
          >
            How it Works
          </a>
        </nav>

        {/* Right - Local Engine Status Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDiagnostics}
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-hh-cream-light hover:bg-white text-hh-black border border-hh-black shadow-hh-sm text-xs font-technical transition-all active:translate-x-0.5 active:translate-y-0.5"
            title="Inspect local engines & system diagnostic"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isEngineReady ? 'bg-hh-green animate-pulse' : 'bg-hh-pink'
              }`}
            />
            <span className="hidden sm:inline font-medium">{engineStatusText}</span>
            <span className="sm:hidden font-medium">Engine</span>
            <Cpu className="w-3.5 h-3.5 text-hh-muted ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
