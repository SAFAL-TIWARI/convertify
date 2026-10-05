import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Table,
  FileCode,
  Copy,
  Check,
  Maximize2,
} from 'lucide-react';

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
  const [pdfViewMode, setPdfViewMode] = useState<'visual' | 'text'>('visual');
  const [copied, setCopied] = useState(false);

  const normExt = format.toLowerCase().replace(/^\./, '');

  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'gif', 'bmp'].includes(normExt);
  const isPdf = normExt === 'pdf';
  const isDocx = normExt === 'docx' || normExt === 'doc' || normExt === 'odt' || normExt === 'rtf';
  const isSpreadsheet = ['xlsx', 'xls', 'csv'].includes(normExt);
  const isCodeOrMarkup = ['html', 'md', 'json', 'txt'].includes(normExt);

  const handleCopyText = () => {
    if (textPreview) {
      navigator.clipboard.writeText(textPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Parse CSV/Tabular lines if spreadsheet
  const spreadsheetRows = isSpreadsheet && textPreview
    ? textPreview
        .split('\n')
        .slice(0, 15)
        .map((row) => row.split(normExt === 'csv' ? ',' : '\t'))
        .filter((r) => r.some((c) => c.trim()))
    : null;

  return (
    <div className="border border-hh-black bg-white shadow-hh-sm overflow-hidden text-xs">
      {/* Preview Container Header */}
      <div className="px-4 py-2.5 bg-hh-cream-dark/60 border-b border-hh-black flex flex-wrap items-center justify-between gap-2 font-technical">
        <div className="flex items-center gap-2 text-hh-black font-semibold">
          {isImage ? (
            <ImageIcon className="w-4 h-4 text-hh-pink" />
          ) : isSpreadsheet ? (
            <Table className="w-4 h-4 text-hh-green" />
          ) : isPdf ? (
            <FileText className="w-4 h-4 text-red-700" />
          ) : isCodeOrMarkup ? (
            <FileCode className="w-4 h-4 text-hh-green" />
          ) : (
            <FileText className="w-4 h-4 text-hh-green" />
          )}

          <span className="uppercase tracking-wider">
            Preview: {filename}
          </span>
          <span className="px-1.5 py-0.2 bg-hh-cream border border-hh-border text-[10px] uppercase font-bold text-hh-green">
            .{normExt}
          </span>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex items-center gap-3">
          {/* PDF mode toggle if text is also available */}
          {isPdf && textPreview && (
            <div className="flex items-center border border-hh-border rounded overflow-hidden text-[10px]">
              <button
                type="button"
                onClick={() => setPdfViewMode('visual')}
                className={`px-2 py-0.5 transition-colors ${
                  pdfViewMode === 'visual'
                    ? 'bg-hh-green text-white font-bold'
                    : 'bg-white hover:bg-hh-cream text-hh-black'
                }`}
              >
                Visual PDF
              </button>
              <button
                type="button"
                onClick={() => setPdfViewMode('text')}
                className={`px-2 py-0.5 transition-colors ${
                  pdfViewMode === 'text'
                    ? 'bg-hh-green text-white font-bold'
                    : 'bg-white hover:bg-hh-cream text-hh-black'
                }`}
              >
                Extracted Text
              </button>
            </div>
          )}

          {textPreview && (
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1 text-[11px] text-hh-muted hover:text-hh-black"
              title="Copy preview text to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-hh-green" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Text
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1 text-[11px] text-hh-muted hover:text-hh-black"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-3 h-3" /> Hide
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" /> Show
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Preview Body */}
      {showPreview && (
        <div className="p-4 bg-hh-cream-light/30">
          {/* 1. Image View */}
          {isImage && previewUrl && (
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-hh-border">
              <img
                src={previewUrl}
                alt={filename}
                className="max-h-80 max-w-full object-contain shadow-sm border border-hh-border"
                loading="lazy"
              />
              <div className="mt-2 text-[10px] font-technical text-hh-muted flex items-center gap-2">
                <span>Direct local render</span>
                <span>•</span>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-hh-green hover:underline inline-flex items-center gap-0.5"
                >
                  <Maximize2 className="w-2.5 h-2.5" /> Full Size
                </a>
              </div>
            </div>
          )}

          {/* 2. PDF View */}
          {isPdf && previewUrl && (
            <div className="space-y-2">
              {pdfViewMode === 'visual' ? (
                <div className="relative w-full border border-hh-border bg-white overflow-hidden shadow-inner">
                  {/* Object with fallback iframe to maximize browser compatibility */}
                  <object
                    data={`${previewUrl}#toolbar=1&navpanes=0`}
                    type="application/pdf"
                    className="w-full h-96"
                  >
                    <iframe
                      src={previewUrl}
                      title="PDF Document Preview"
                      className="w-full h-96"
                    />
                  </object>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <pre className="p-4 bg-white border border-hh-border font-technical text-[11px] text-hh-black whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                    {textPreview || '(No text extracted from PDF)'}
                  </pre>
                  <div className="text-[10px] font-technical text-hh-muted">
                    Showing text content extracted from the converted PDF
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] font-technical text-hh-muted pt-1">
                <span>PDF Document Preview</span>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-hh-green font-semibold hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open PDF in New Window
                </a>
              </div>
            </div>
          )}

          {/* 3. DOCX Word Document View */}
          {isDocx && textPreview && (
            <div className="space-y-2">
              <div className="p-4 bg-white border border-hh-border max-h-80 overflow-y-auto shadow-sm space-y-2 leading-relaxed">
                {textPreview.split(/\n\s*\n/).map((para, idx) => (
                  <p key={idx} className="font-sans text-xs text-hh-black">
                    {para}
                  </p>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] font-technical text-hh-muted">
                <span>Extracted paragraphs from converted Word Document (.docx)</span>
                <span>{textPreview.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>
          )}

          {/* 4. Spreadsheet View (XLSX, XLS, CSV) */}
          {isSpreadsheet && spreadsheetRows && spreadsheetRows.length > 0 && (
            <div className="space-y-2">
              <div className="overflow-x-auto border border-hh-border bg-white max-h-80">
                <table className="w-full text-left font-technical text-[11px] border-collapse">
                  <tbody>
                    {spreadsheetRows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={
                          rIdx === 0
                            ? 'bg-hh-cream font-bold text-hh-black border-b border-hh-border'
                            : 'border-b border-hh-border/50 hover:bg-slate-50'
                        }
                      >
                        <td className="px-2 py-1 text-hh-muted/60 text-[10px] border-r border-hh-border select-none bg-slate-50">
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-1.5 border-r border-hh-border/40 whitespace-nowrap">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-[10px] font-technical text-hh-muted">
                Showing top rows of spreadsheet data
              </div>
            </div>
          )}

          {/* 5. Generic Text / Markdown / Code View */}
          {isCodeOrMarkup && textPreview && (
            <div className="space-y-1.5">
              <pre className="p-3 bg-white border border-hh-border font-technical text-[11px] text-hh-black whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                {textPreview}
              </pre>
              <div className="text-[10px] font-technical text-hh-muted">
                Showing text preview of converted file
              </div>
            </div>
          )}

          {/* 6. Fallback if no specific preview engine matched or text was empty */}
          {!isImage && !isPdf && !textPreview && (
            <div className="p-6 bg-white border border-hh-border text-center space-y-2">
              <FileText className="w-8 h-8 text-hh-green mx-auto" />
              <div className="font-serif text-sm font-bold text-hh-black">
                {filename}
              </div>
              <p className="text-xs font-technical text-hh-muted max-w-sm mx-auto">
                File generated successfully and ready for download. Use the download button below to save the file to your device.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
