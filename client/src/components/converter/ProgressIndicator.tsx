import React from 'react';
import { JobStatus } from '@shared/types/index.js';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  status: JobStatus;
  stageMessage?: string;
  errorMessage?: string;
}

const STAGES = [
  { id: 'READY_TO_CONVERT', label: 'Queued' },
  { id: 'CONVERTING', label: 'Converting' },
  { id: 'VERIFYING', label: 'Verifying' },
  { id: 'COMPLETED', label: 'Ready' },
];

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  status,
  stageMessage,
  errorMessage,
}) => {
  if (status === 'IDLE' || status === 'FILE_SELECTED') return null;

  const getStageIndex = (s: JobStatus): number => {
    switch (s) {
      case 'READY_TO_CONVERT':
        return 0;
      case 'CONVERTING':
        return 1;
      case 'VERIFYING':
        return 2;
      case 'COMPLETED':
        return 3;
      default:
        return -1;
    }
  };

  const currentIndex = getStageIndex(status);

  return (
    <div className="w-full bg-white border border-hh-black shadow-hh p-6 space-y-5 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status === 'COMPLETED' ? (
            <CheckCircle2 className="w-5 h-5 text-hh-green" />
          ) : status === 'FAILED' ? (
            <AlertCircle className="w-5 h-5 text-hh-pink" />
          ) : (
            <Loader2 className="w-5 h-5 text-hh-green animate-spin" />
          )}

          <div>
            <h3 className="font-serif text-lg font-bold text-hh-black">
              {status === 'COMPLETED'
                ? 'Done. Your file is ready.'
                : status === 'FAILED'
                ? "We couldn't finish that conversion."
                : 'Processing File Locally'}
            </h3>
            <p className="text-xs font-technical text-hh-muted">
              {stageMessage || (status === 'CONVERTING' ? 'Running local engine...' : '')}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-technical uppercase tracking-wider px-2 py-0.5 border border-hh-black bg-hh-cream">
          {status}
        </span>
      </div>

      {/* Stage-Based Progress Stepper (No fake percentages) */}
      {status !== 'FAILED' && (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2">
            {STAGES.map((stage, idx) => {
              const isPast = currentIndex > idx;
              const isCurrent = currentIndex === idx;

              return (
                <div key={stage.id} className="space-y-1.5">
                  <div
                    className={`h-2 border border-hh-black transition-all ${
                      isPast
                        ? 'bg-hh-green'
                        : isCurrent
                        ? 'bg-hh-yellow animate-pulse'
                        : 'bg-hh-cream-dark'
                    }`}
                  />
                  <div className="flex items-center justify-between text-[10px] font-technical">
                    <span
                      className={`${
                        isCurrent
                          ? 'font-bold text-hh-black'
                          : isPast
                          ? 'text-hh-green'
                          : 'text-hh-muted'
                      }`}
                    >
                      {stage.label}
                    </span>
                    {isPast && <span className="text-hh-green font-bold">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Failure Message */}
      {status === 'FAILED' && errorMessage && (
        <div className="p-3 bg-red-50 border border-red-400 text-xs font-technical text-red-900 leading-relaxed">
          {errorMessage}
          <div className="mt-1 text-[11px] text-red-700">
            Try a different output format or another file.
          </div>
        </div>
      )}
    </div>
  );
};
