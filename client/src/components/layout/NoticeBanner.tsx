import React from 'react';
import { ShieldCheck, HardDrive } from 'lucide-react';

export const NoticeBanner: React.FC = () => {
  return (
    <div className="bg-hh-deep-green text-hh-cream-light py-2 px-4 text-xs font-technical border-b border-hh-black flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 max-w-4xl">
        <ShieldCheck className="w-3.5 h-3.5 text-hh-yellow flex-shrink-0" />
        <span>
          <strong className="text-white font-semibold">LOCAL-FIRST PRIVACY:</strong> Files stay on your machine. Conversions run via your local Node converter and are deleted immediately after the job.
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-hh-cream/80">
        <span className="flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-hh-pink" /> 500 MB MAX LIMIT
        </span>
        <span className="hidden sm:inline-block text-hh-yellow">•</span>
        <span className="hidden sm:inline-block">ZERO CLOUD UPLOAD</span>
      </div>
    </div>
  );
};
