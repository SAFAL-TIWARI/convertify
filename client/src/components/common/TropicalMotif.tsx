import React from 'react';

/**
 * Editorial palm frond / leaf SVG motif in thin line art
 */
export const PalmIcon: React.FC<{ className?: string; strokeWidth?: number }> = ({
  className = 'w-5 h-5',
  strokeWidth = 1.5,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 21V9" />
    <path d="M12 9C9 6 4 6 2 9c3 3 7 3 10 0z" />
    <path d="M12 9c3-3 8-3 10 0-3 3-7 3-10 0z" />
    <path d="M12 14c-3-2-6-1-8 1 2 2 5 2 8-1z" />
    <path d="M12 14c3-2 6-1 8 1-2 2-5 2-8-1z" />
  </svg>
);

/**
 * Editorial sunburst / sunrise motif
 */
export const SunMotif: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.1" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

/**
 * Coastal ocean wave motif
 */
export const WaveMotif: React.FC<{ className?: string }> = ({ className = 'w-16 h-3' }) => (
  <svg
    viewBox="0 0 64 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M2 6c4-4 8-4 12 0s8 4 12 0 8-4 12 0 8 4 12 0 8-4 12 0" />
  </svg>
);

/**
 * Technical grid marker (+)
 */
export const GridCross: React.FC<{ className?: string }> = ({ className = 'w-3 h-3 text-hh-muted' }) => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
    <path d="M6 1v10M1 6h10" />
  </svg>
);
