/**
 * ArchetypeBadge Component
 *
 * Displays the student's archetype with appropriate styling and icon.
 * v1.0.0 - Strategic Intelligence UI
 */

'use client';

import { cn } from '@/lib/utils/cn';
import type { Archetype } from '@/lib/store/useResultsStore';

interface ArchetypeBadgeProps {
  archetype: Archetype | string;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  showConfidence?: boolean;
  className?: string;
}

const ARCHETYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  academic_powerhouse: {
    label: 'Academic Powerhouse',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '\u{1F393}', // Graduation cap
  },
  stem_innovator: {
    label: 'STEM Innovator',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '\u{1F52C}', // Microscope
  },
  creative_visionary: {
    label: 'Creative Visionary',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '\u{1F3A8}', // Palette
  },
  community_changemaker: {
    label: 'Community Changemaker',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '\u{1F30D}', // Globe
  },
  entrepreneurial_leader: {
    label: 'Entrepreneurial Leader',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '\u{1F680}', // Rocket
  },
  humanities_scholar: {
    label: 'Humanities Scholar',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '\u{1F4DA}', // Books
  },
  athletic_scholar: {
    label: 'Athletic Scholar',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    icon: '\u{26BD}', // Soccer ball
  },
  multi_hyphenate: {
    label: 'Multi-Hyphenate',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    icon: '\u{2728}', // Sparkles
  },
};

export function ArchetypeBadge({
  archetype,
  confidence,
  size = 'md',
  showConfidence = true,
  className,
}: ArchetypeBadgeProps) {
  const config = ARCHETYPE_CONFIG[archetype] || {
    label: archetype.replace(/_/g, ' '),
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '\u{1F464}', // Person silhouette
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {showConfidence && confidence !== undefined && (
        <span className="opacity-60 text-xs">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </span>
  );
}

export default ArchetypeBadge;
