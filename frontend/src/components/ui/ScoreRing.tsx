'use client';

/**
 * ScoreRing Component
 *
 * STYLING: Uses BRAND_COLORS constants for consistent Ivylevel branding.
 */

import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import { BRAND_COLORS } from '@/lib/constants/brand';

export interface ScoreRingProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const ScoreRing = ({
  score,
  size = 'md',
  strokeWidth,
  showLabel = true,
  label,
  animated = true,
  className,
}: ScoreRingProps) => {
  const sizes = {
    sm: { width: 80, fontSize: 'text-lg', labelSize: 'text-xs' },
    md: { width: 120, fontSize: 'text-2xl', labelSize: 'text-sm' },
    lg: { width: 160, fontSize: 'text-4xl', labelSize: 'text-base' },
    xl: { width: 200, fontSize: 'text-5xl', labelSize: 'text-lg' },
  };

  const config = sizes[size];
  const defaultStrokeWidth = strokeWidth ?? config.width / 12;
  const radius = (config.width - defaultStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Color based on score - using brand colors
  const getStrokeColor = () => {
    if (score >= 80) return BRAND_COLORS.success;
    if (score >= 60) return BRAND_COLORS.primary;
    if (score >= 40) return BRAND_COLORS.warning;
    return BRAND_COLORS.error;
  };

  const getGlowStyle = () => {
    const color = getStrokeColor();
    return {
      filter: `drop-shadow(0 0 15px ${color}80)`,
    };
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.width}
        height={config.width}
        className="transform -rotate-90"
        style={getGlowStyle()}
      >
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke={BRAND_COLORS.borderLight}
          strokeWidth={defaultStrokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          strokeWidth={defaultStrokeWidth}
          strokeLinecap="round"
          stroke={getStrokeColor()}
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={animated ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className={cn('font-display font-bold', config.fontSize)}
          style={{ color: BRAND_COLORS.textHeading }}
        >
          {score}
        </motion.span>
        {showLabel && (
          <motion.span
            initial={animated ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={config.labelSize}
            style={{ color: BRAND_COLORS.textMuted }}
          >
            {label ?? 'Ivy+ Score'}
          </motion.span>
        )}
      </div>
    </div>
  );
};

// Mini score badge variant
export interface ScoreBadgeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const ScoreBadge = ({
  score,
  label,
  size = 'md',
  className,
}: ScoreBadgeProps) => {
  const getColors = () => {
    if (score >= 80) return {
      bg: BRAND_COLORS.bgSuccess,
      text: BRAND_COLORS.success,
      border: `${BRAND_COLORS.success}30`,
    };
    if (score >= 60) return {
      bg: BRAND_COLORS.primaryBg,
      text: BRAND_COLORS.primary,
      border: `${BRAND_COLORS.primary}30`,
    };
    if (score >= 40) return {
      bg: BRAND_COLORS.bgWarning,
      text: BRAND_COLORS.warning,
      border: `${BRAND_COLORS.warning}30`,
    };
    return {
      bg: BRAND_COLORS.bgError,
      text: BRAND_COLORS.error,
      border: `${BRAND_COLORS.error}30`,
    };
  };

  const colors = getColors();

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        sizes[size],
        className
      )}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      <span>{score}%</span>
      {label && <span className="opacity-75">{label}</span>}
    </span>
  );
};

export { ScoreRing, ScoreBadge };
