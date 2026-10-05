import React, { useState } from 'react';
import { Eye, EyeOff, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';

interface FilePreviewProps {
  format: string;
  previewUrl?: string;
  textPreview?: string;
  filename: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  format,
  previewUrl,
  textPreview,
  filename,
}) => {
  const [showPreview, setShowPreview] = useState(true);
  const normExt = format.toLowerCase().replace(/^\./, '');

  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(normExt);
  const isPdf = normExt === 'pdf';
  const isText = Boolean(textPreview);

  if (!isImage && !isPdf && !isText) {
    return null;
  }

  return (
    <div className="border border-hh-black bg-white shadow-hh-sm overflow-hidden text-xs">
      <div className="px-4 py-2 bg-hh-cream-dark/60 border-b border-hh-black flex items-center justify-between font-technical">
        <div className="flex items-center gap-2 text-hh-black font-semibold">
          {isImage ? (
            <ImageIcon className="w-3.5 h-3.5 text-hh-pink" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-hh-green" />
          )}
          <span className="uppercase tracking-wider">Preview ({normExt.toUpperCase()})</span>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center gap-1 text-[11px] text-hh-muted hover:text-hh-black"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-3 h-3" /> Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" /> Show Preview
            </>
          )}
        </button>
      </div>

      {showPreview && (
        <div className="p-4 bg-hh-cream-light/30">
          {/* Image Preview */}
          {isImage && previewUrl && (
            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-hh-border">
              <img
                src={previewUrl}
                alt={filename}
                className="max-h-72 max-w-full object-contain shadow-sm border border-hh-border"
                loading="lazy"
              />
              <span className="text-[10px] font-technical text-hh-muted mt-2">
                Converted image rendered directly from local storage
              </span>
            </div>
          )}

          {/* PDF Preview */}
          {isPdf && previewUrl && (
            <div className="space-y-2">
              <iframe
                src={`${previewUrl}#toolbar=0`}
                title="PDF Preview"
                className="w-full h-80 border border-hh-border bg-white"
              />
              <div className="text-right">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-technical text-hh-green hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> Open in full window
                </a>
              </div>
            </div>
          )}

          {/* Text / Markdown / Extracted Snippet Preview */}
          {isText && textPreview && (
            <div className="space-y-1.5">
              <pre className="p-3 bg-white border border-hh-border font-technical text-[11px] text-hh-black whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
                {textPreview}
              </pre>
              <div className="text-[10px] font-technical text-hh-muted">
                Showing text snippet extracted from output document
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
