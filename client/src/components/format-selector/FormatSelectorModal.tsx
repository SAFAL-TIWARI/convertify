import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Lock, Check } from 'lucide-react';
import { FormatDefinition, FileCategory } from '@shared/types/index.js';

interface FormatSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormat: (formatExt: string) => void;
  currentSelected?: string;
  allowedOutputs: string[]; // List of extensions supported for the current input file
  allFormats: Record<string, FormatDefinition>;
}

const CATEGORY_TABS: Array<{ id: FileCategory | 'all'; label: string; active: boolean }> = [
  { id: 'all', label: 'All Formats', active: true },
  { id: 'document', label: 'Document', active: true },
  { id: 'image', label: 'Image', active: true },
  { id: 'spreadsheet', label: 'Spreadsheet', active: true },
  { id: 'audio', label: 'Audio', active: false },
  { id: 'video', label: 'Video', active: false },
  { id: 'archive', label: 'Archive', active: false },
  { id: 'ebook', label: 'Ebook', active: false },
  { id: 'cad', label: 'CAD', active: false },
  { id: 'font', label: 'Font', active: false },
  { id: 'vector', label: 'Vector', active: false },
];

export const FormatSelectorModal: React.FC<FormatSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectFormat,
  currentSelected,
  allowedOutputs,
  allFormats,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'all'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Allowed output set for rapid lookup
  const allowedSet = useMemo(() => new Set(allowedOutputs.map((o) => o.toLowerCase())), [
    allowedOutputs,
  ]);

  // Filter formats based on search and category
  const filteredFormats = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = Object.values(allFormats);

    return list.filter((fmt) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'spreadsheet') {
          if (!['xlsx', 'xls', 'csv'].includes(fmt.ext)) return false;
        } else if (fmt.category !== selectedCategory) {
          return false;
        }
      }

      // Search filter
      if (query) {
        const matchesExt = fmt.ext.toLowerCase().includes(query);
        const matchesName = fmt.name.toLowerCase().includes(query);
        return matchesExt || matchesName;
      }

      return true;
    });
  }, [allFormats, selectedCategory, search]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="format-modal-title"
    >
      <div
        className="w-full max-w-2xl bg-hh-cream border-2 border-hh-black shadow-hh overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-hh-green text-hh-cream px-6 py-4 border-b border-hh-black flex items-center justify-between">
          <div>
            <h2 id="format-modal-title" className="font-serif text-xl font-bold tracking-tight text-white">
              Choose Target Format
            </h2>
            <p className="text-xs font-technical text-hh-yellow tracking-wider uppercase mt-0.5">
              {allowedOutputs.length > 0
                ? `${allowedOutputs.length} formats available for this file`
                : 'Select an output format'}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-hh-cream hover:text-white hover:bg-black/20 rounded transition-colors"
            aria-label="Close format selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-hh-cream-light border-b border-hh-border">
          <div className="relative">
            <Search className="w-4 h-4 text-hh-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search formats by name or extension (e.g. DOCX, WEBP, PDF)..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-hh-black text-sm font-technical focus:outline-none focus:ring-2 focus:ring-hh-green"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-hh-muted hover:text-hh-black"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-hh-border bg-hh-cream overflow-x-auto text-xs font-technical scrollbar-none">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 whitespace-nowrap transition-colors border ${
                selectedCategory === tab.id
                  ? 'bg-hh-deep-green text-white border-hh-black shadow-hh-sm font-semibold'
                  : 'bg-white/60 hover:bg-white text-hh-black border-transparent'
              }`}
            >
              {tab.label}
              {!tab.active && (
                <span className="ml-1 text-[10px] text-hh-muted uppercase tracking-tighter">
                  (soon)
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Formats Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {filteredFormats.length === 0 ? (
            <div className="text-center py-12 text-hh-muted">
              <p className="font-serif text-lg">No formats match "{search}"</p>
              <p className="text-xs font-technical mt-1">Try another search term or select "All Formats"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredFormats.map((fmt) => {
                const isSupportedForInput = allowedSet.has(fmt.ext.toLowerCase());
                const isSelected = currentSelected?.toLowerCase() === fmt.ext.toLowerCase();
                const isComingSoon = !fmt.isActive;

                // An item is selectable if it's active AND supported for the current input
                const isSelectable = isSupportedForInput && fmt.isActive;

                return (
                  <button
                    key={fmt.ext}
                    disabled={!isSelectable}
                    onClick={() => {
                      if (isSelectable) {
                        onSelectFormat(fmt.ext);
                        onClose();
                      }
                    }}
                    type="button"
                    className={`relative p-3 text-left border transition-all text-xs flex flex-col justify-between min-h-[82px] ${
                      isSelected
                        ? 'bg-hh-green text-white border-hh-black shadow-hh-green font-medium'
                        : isSelectable
                        ? 'bg-white hover:bg-hh-cream-light text-hh-black border-hh-black shadow-hh-sm hover:-translate-y-0.5'
                        : 'bg-hh-cream-dark/50 text-hh-muted/70 border-hh-border cursor-not-allowed opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <span className="font-technical text-sm font-bold uppercase tracking-wider">
                        .{fmt.ext}
                      </span>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-hh-yellow" />
                      ) : isComingSoon ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-technical px-1.5 py-0.5 bg-black/5 text-hh-muted rounded">
                          <Lock className="w-2.5 h-2.5" /> Soon
                        </span>
                      ) : !isSupportedForInput ? (
                        <span className="text-[10px] font-technical text-hh-muted">
                          Unavailable
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2">
                      <div className="font-sans text-[11px] truncate font-medium">
                        {fmt.name}
                      </div>
                      <div className="text-[10px] font-technical text-inherit opacity-75 uppercase">
                        {fmt.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-hh-cream-light border-t border-hh-black flex items-center justify-between text-xs font-technical text-hh-muted">
          <span>Click any available format to select</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-hh-cream border border-hh-black text-hh-black shadow-hh-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
