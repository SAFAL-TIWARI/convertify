import React from 'react';
import { UploadCloud, ArrowRightLeft, Cpu, DownloadCloud } from 'lucide-react';
import { GridCross, SunMotif } from '../common/TropicalMotif.js';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Choose your file',
      description: 'Select from your local disk or drag & drop. Files up to 500 MB validated locally.',
      icon: UploadCloud,
    },
    {
      step: '02',
      title: 'Pick the output',
      description: 'Dynamic format registry filters only genuine, supported conversion paths.',
      icon: ArrowRightLeft,
    },
    {
      step: '03',
      title: 'Convert locally',
      description: 'Processed by your machine using Sharp and Node engines without cloud uploads.',
      icon: Cpu,
    },
    {
      step: '04',
      title: 'Download & Done',
      description: 'Immediate verified download. Temporary files are automatically purged.',
      icon: DownloadCloud,
    },
  ];

  return (
    <section id="how-it-works" className="space-y-8 pt-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-hh-black">
        <div>
          <span className="text-xs font-technical text-hh-green uppercase tracking-widest">
            // WORKFLOW PIPELINE
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-hh-black tracking-tight mt-1">
            How It Works
          </h3>
        </div>
        <SunMotif className="w-6 h-6 text-hh-yellow hidden sm:block" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="p-6 bg-white border border-hh-black shadow-hh-sm relative space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-technical text-2xl font-bold text-hh-green">
                  {s.step}
                </span>
                <Icon className="w-5 h-5 text-hh-pink" />
              </div>

              <div>
                <h4 className="font-serif text-lg font-bold text-hh-black">
                  {s.title}
                </h4>
                <p className="text-xs text-hh-muted mt-1.5 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="absolute bottom-2 right-2 pointer-events-none opacity-40">
                <GridCross />
              </div>
            </div>
          );
        })}
      </div>

      {/* About Box */}
      <div className="p-6 bg-hh-cream-light border border-hh-black shadow-hh-sm mt-8 space-y-2">
        <h4 className="font-serif text-base font-bold text-hh-black">
          About Convertify
        </h4>
        <p className="text-xs sm:text-sm text-hh-muted leading-relaxed">
          Convertify is a local-first file utility built around practical conversion workflows. It uses local/open-source conversion engines instead of sending your files to a cloud conversion API.
        </p>
        <p className="text-xs font-technical text-hh-green pt-1">
          Independent builder project inspired by the HH Goa 2026 design language.
        </p>
      </div>
    </section>
  );
};
