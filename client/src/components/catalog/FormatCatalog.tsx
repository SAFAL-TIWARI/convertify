import React, { useState } from 'react';
import { ArrowRight, Lock, Sparkles, Layers, FileCheck } from 'lucide-react';
import { FormatDefinition, ConversionPair, FileCategory } from '../../../shared/types/index.js';
import { WaveMotif } from '../common/TropicalMotif.js';

interface FormatCatalogProps {
  formats: Record<string, FormatDefinition>;
  popularPairs: ConversionPair[];
  onSelectQuickTool: (fromExt: string, toExt: string) => void;
}

export const FormatCatalog: React.FC<FormatCatalogProps> = ({
  formats,
  popularPairs,
  onSelectQuickTool,
}) => {
  const [activeTab, setActiveTab] = useState<
    'all' | 'document' | 'image' | 'audio' | 'video' | 'archive'
  >('all');

  const categories = [
    { id: 'all', label: 'All Formats', active: true },
    { id: 'document', label: 'Documents', active: true },
    { id: 'image', label: 'Images', active: true },
    { id: 'audio', label: 'Audio', active: false },
    { id: 'video', label: 'Video', active: false },
    { id: 'archive', label: 'Archives', active: false },
  ] as const;

  const formatList = Object.values(formats);

  const displayedFormats = formatList.filter((fmt) => {
    if (activeTab === 'all') return true;
    return fmt.category === activeTab;
  });

  return (
    <section id="formats" className="space-y-12">
      {/* SECTION 1: POPULAR TOOL CARDS */}
      <div id="tools" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-hh-black">
          <div>
            <span className="text-xs font-technical text-hh-green uppercase tracking-widest">
              // INSTANT TOOLS
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-hh-black tracking-tight mt-1">
              Active Tool Shortcuts
            </h3>
          </div>
          <p className="text-xs font-technical text-hh-muted max-w-sm">
            Click any shortcut to preload the target format and initiate conversion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularPairs.map((pair) => (
            <button
              key={`${pair.from}-${pair.to}`}
              type="button"
              onClick={() => onSelectQuickTool(pair.from, pair.to)}
              className="p-5 bg-white hover:bg-hh-cream-light border border-hh-black shadow-hh-sm hover:shadow-hh transition-all text-left flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-technical uppercase px-2 py-0.5 border border-hh-black bg-hh-cream text-hh-black">
                    {pair.category}
                  </span>
                  <div className="flex items-center gap-1.5 font-technical font-bold text-xs">
                    <span className="text-hh-black uppercase">.{pair.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-hh-pink group-hover:translate-x-1 transition-transform" />
                    <span className="text-hh-green uppercase">.{pair.to}</span>
                  </div>
                </div>

                <h4 className="font-serif text-lg font-bold text-hh-black group-hover:text-hh-green transition-colors">
                  {pair.label}
                </h4>
                <p className="text-xs text-hh-muted mt-1 leading-relaxed">
                  {pair.description}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-hh-border flex items-center justify-between text-xs font-technical text-hh-green font-semibold">
                <span>Start conversion</span>
                <span className="text-hh-pink">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 2: COMPREHENSIVE FORMAT CATALOG */}
      <div className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-hh-black">
          <div>
            <span className="text-xs font-technical text-hh-green uppercase tracking-widest">
              // COMPREHENSIVE CAPABILITIES
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-hh-black tracking-tight mt-1">
              Format Catalog
            </h3>
          </div>
          <WaveMotif className="w-20 h-4 text-hh-green hidden sm:block" />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 text-xs font-technical uppercase border transition-all whitespace-nowrap ${
                activeTab === cat.id
                  ? 'bg-hh-black text-white border-hh-black shadow-hh-sm font-bold'
                  : 'bg-white hover:bg-hh-cream text-hh-black border-hh-black'
              }`}
            >
              {cat.label}
              {!cat.active && (
                <span className="ml-1.5 text-[10px] text-hh-muted lowercase">
                  (coming soon)
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Formats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedFormats.map((fmt) => {
            const isComingSoon = !fmt.isActive;

            return (
              <div
                key={fmt.ext}
                className={`p-5 border border-hh-black flex flex-col justify-between transition-all ${
                  isComingSoon
                    ? 'bg-hh-cream-dark/40 opacity-75 border-dashed'
                    : 'bg-white shadow-hh-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="font-technical text-lg font-bold text-hh-black uppercase tracking-wider">
                      .{fmt.ext}
                    </span>

                    {isComingSoon ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-technical px-2 py-0.5 bg-hh-cream border border-hh-black text-hh-muted">
                        <Lock className="w-3 h-3" /> Coming soon
                      </span>
                    ) : (
                      <span className="text-[10px] font-technical px-2 py-0.5 bg-hh-green text-white font-medium uppercase">
                        Live
                      </span>
                    )}
                  </div>

                  <h5 className="font-serif text-sm font-bold text-hh-black mt-2">
                    {fmt.name}
                  </h5>

                  <p className="text-xs text-hh-muted mt-1 leading-relaxed">
                    {fmt.description || 'Verified local conversion support.'}
                  </p>
                </div>

                {/* Outputs list */}
                <div className="mt-4 pt-3 border-t border-hh-border">
                  <div className="text-[10px] font-technical uppercase text-hh-muted mb-1.5">
                    {isComingSoon ? 'Planned Outputs:' : 'Converts To:'}
                  </div>
                  {isComingSoon ? (
                    <span className="text-[11px] font-technical text-hh-muted italic">
                      Scheduled in upcoming media engine rollout.
                    </span>
                  ) : fmt.outputs.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {fmt.outputs.map((out) => (
                        <span
                          key={out}
                          className="px-1.5 py-0.5 bg-hh-cream-light border border-hh-border text-[10px] font-technical uppercase text-hh-black font-medium"
                        >
                          .{out}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] font-technical text-hh-muted">
                      Direct view & extraction supported
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
