/**
 * SpikeIndicator Component
 *
 * Displays the student's spike (primary differentiator) with visual styling.
 * v1.0.0 - Strategic Intelligence UI
 */

'use client';

import { cn } from '@/lib/utils/cn';
import { BRAND_COLORS } from '@/lib/constants/brand';

interface SpikeIndicatorProps {
  spike: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

export function SpikeIndicator({
  spike,
  size = 'md',
  variant = 'default',
  className,
}: SpikeIndicatorProps) {
  if (!spike) {
    return null;
  }

  const sizeStyles = {
    sm: { text: 'text-sm', bar: 'w-0.5 h-5' },
    md: { text: 'text-lg', bar: 'w-1 h-8' },
    lg: { text: 'text-xl', bar: 'w-1.5 h-10' },
  };

  const styles = sizeStyles[size];

  if (variant === 'inline') {
    return (
      <span
        className={cn('font-semibold', className)}
        style={{ color: BRAND_COLORS.primary }}
      >
        {spike}
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="text-gray-500 text-sm">Spike:</span>
        <span
          className={cn('font-semibold', styles.text)}
          style={{ color: BRAND_COLORS.secondary }}
        >
          {spike}
        </span>
      </div>
    );
  }

  // Default variant with gradient bar
  return (
    <div className={cn('flex items-center gap-2 mt-1', className)}>
      <div
        className={cn(styles.bar, 'flex-shrink-0 rounded-full')}
        style={{
          background: `linear-gradient(to bottom, ${BRAND_COLORS.primary}, #9333ea)`,
        }}
      />
      <p
        className={cn('font-semibold', styles.text)}
        style={{ color: BRAND_COLORS.textHeading }}
      >
        {spike}
      </p>
    </div>
  );
}

export default SpikeIndicator;
