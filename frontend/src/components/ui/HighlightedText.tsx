/**
 * HighlightedText Component
 *
 * Renders text with specific words highlighted in the brand primary color (orange).
 * Used for the "magic sauce" title styling - mixing maroon/black with orange highlights.
 *
 * Usage examples:
 * - <HighlightedText text="6 Assessment Frames" highlights={["6"]} />
 * - <HighlightedText text="AI-Powered Analysis" highlights={["AI-Powered"]} />
 * - <HighlightedText text="Strategic Power-Ups" highlights={["Power-Ups"]} />
 */

'use client';

import React from 'react';
import { BRAND_COLORS } from '@/lib/constants/brand';

export interface HighlightedTextProps {
  /** The full text to render */
  text: string;
  /** Array of words/phrases to highlight in primary color */
  highlights?: string[];
  /** Base text color (default: textHeading) */
  baseColor?: string;
  /** Highlight color (default: primary orange) */
  highlightColor?: string;
  /** Additional className for the container */
  className?: string;
  /** HTML tag to use (default: span) */
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div';
}

export function HighlightedText({
  text,
  highlights = [],
  baseColor = BRAND_COLORS.textHeading,
  highlightColor = BRAND_COLORS.primary,
  className = '',
  as: Component = 'span',
}: HighlightedTextProps) {
  if (highlights.length === 0) {
    return (
      <Component className={className} style={{ color: baseColor }}>
        {text}
      </Component>
    );
  }

  // Create a regex pattern to match all highlights (case insensitive)
  const pattern = new RegExp(`(${highlights.map(escapeRegex).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <Component className={className} style={{ color: baseColor }}>
      {parts.map((part, index) => {
        const isHighlight = highlights.some(
          (h) => h.toLowerCase() === part.toLowerCase()
        );

        if (isHighlight) {
          return (
            <span key={index} style={{ color: highlightColor }}>
              {part}
            </span>
          );
        }
        return part;
      })}
    </Component>
  );
}

// Helper to escape special regex characters
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Pre-configured title component with Frame heading styling
 */
export interface FrameTitleProps {
  text: string;
  highlights?: string[];
  className?: string;
}

export function FrameTitle({ text, highlights, className = '' }: FrameTitleProps) {
  return (
    <HighlightedText
      text={text}
      highlights={highlights}
      baseColor={BRAND_COLORS.textHeading}
      highlightColor={BRAND_COLORS.primary}
      as="h2"
      className={`text-2xl md:text-3xl font-display font-bold ${className}`}
    />
  );
}

/**
 * Pre-configured subtitle component with Frame subtitle styling
 */
export interface FrameSubtitleProps {
  text: string;
  className?: string;
}

export function FrameSubtitle({ text, className = '' }: FrameSubtitleProps) {
  return (
    <p
      className={`text-base md:text-lg ${className}`}
      style={{ color: BRAND_COLORS.textSecondary }}
    >
      {text}
    </p>
  );
}

/**
 * Pre-configured number highlight - for statistics and counts
 */
export interface StatNumberProps {
  value: number | string;
  label?: string;
  className?: string;
}

export function StatNumber({ value, label, className = '' }: StatNumberProps) {
  return (
    <span className={className}>
      <span style={{ color: BRAND_COLORS.primary }} className="font-bold">
        {value}
      </span>
      {label && (
        <span style={{ color: BRAND_COLORS.textHeading }}> {label}</span>
      )}
    </span>
  );
}

export default HighlightedText;
