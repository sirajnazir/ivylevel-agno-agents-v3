/**
 * CollegeLogo Component
 * Displays college/university logos with consistent styling
 * Uses original BW logos from Ivylevel design system
 *
 * Note: Original logos are horizontal wordmarks with varying widths.
 * This component normalizes them to consistent visual sizing.
 */

'use client';

import React from 'react';
import { BRAND_COLORS } from '@/lib/constants/brand';

interface CollegeLogoProps {
  schoolId: string;
  /** Height of the logo in pixels (width scales proportionally) */
  size?: number;
  className?: string;
  showFallback?: boolean;
}

// College logo paths - BW logos from original design system
const COLLEGE_LOGOS: Record<string, string> = {
  HARVARD: '/logos/harvard.svg',
  STANFORD: '/logos/stanford.svg',
  MIT: '/logos/mit.svg',
  YALE: '/logos/yale.svg',
  PRINCETON: '/logos/princeton.svg',
  CALTECH: '/logos/caltech.svg',
  CMU: '/logos/cmu.svg',
  COLUMBIA: '/logos/columbia.svg',
};

// Scale factors to normalize visual size (based on original SVG dimensions)
// Adjusted based on visual testing to achieve consistent appearance
const LOGO_SCALE_FACTORS: Record<string, number> = {
  HARVARD: 1.0,    // reference
  STANFORD: 1.0,   // similar visual weight
  MIT: 0.85,       // appears large, scale down
  YALE: 1.6,       // appears small, scale up more
  PRINCETON: 1.5,  // appears small, scale up
  COLUMBIA: 1.6,   // appears small, scale up more
  CMU: 1.4,        // narrower, scale up
  CALTECH: 1.0,    // square placeholder
};

// Fallback colors for each school (used when logo fails)
const SCHOOL_COLORS: Record<string, string> = {
  HARVARD: '#A51C30',
  STANFORD: '#8C1515',
  MIT: '#A31F34',
  YALE: '#00356B',
  PRINCETON: '#E77500',
  CALTECH: '#FF6C0C',
  CMU: '#C41230',
  COLUMBIA: '#1D4F91',
};

// Short names for fallback display
const SCHOOL_SHORT_NAMES: Record<string, string> = {
  HARVARD: 'H',
  STANFORD: 'S',
  MIT: 'M',
  YALE: 'Y',
  PRINCETON: 'P',
  CALTECH: 'CT',
  CMU: 'CMU',
  COLUMBIA: 'C',
};

export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  schoolId,
  size = 40,
  className = '',
  showFallback = true,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const logoPath = COLLEGE_LOGOS[schoolId];
  const schoolColor = SCHOOL_COLORS[schoolId] || BRAND_COLORS.iconPrimary;
  const shortName = SCHOOL_SHORT_NAMES[schoolId] || schoolId.charAt(0);
  const scaleFactor = LOGO_SCALE_FACTORS[schoolId] || 1.0;

  // If no logo path or error loading, show fallback letter
  if (!logoPath || hasError) {
    if (!showFallback) return null;

    return (
      <div
        className={`flex items-center justify-center rounded-xl font-bold text-white ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: schoolColor,
          fontSize: size * 0.4,
        }}
      >
        {shortName}
      </div>
    );
  }

  // Calculate scaled dimensions - wider container for horizontal logos
  const containerWidth = size * 2.5; // Wide container for wordmark logos
  const containerHeight = size;
  const scaledHeight = size * scaleFactor;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoPath}
        alt={`${schoolId} logo`}
        style={{
          height: scaledHeight,
          width: 'auto',
          objectFit: 'contain',
        }}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

// Export school data for use elsewhere
export { COLLEGE_LOGOS, SCHOOL_COLORS, SCHOOL_SHORT_NAMES };

export default CollegeLogo;
