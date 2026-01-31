'use client';

/**
 * CircularProgress Component
 * Animated circular progress rings for score display
 * @version 11.0
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Heart, Users, Sparkles, type LucideIcon } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showValue?: boolean;
  animated?: boolean;
  label?: string;
  duration?: number;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = BRAND_COLORS.secondary,
  bgColor = '#E5E7EB',
  showValue = true,
  animated = true,
  label,
  duration = 1500,
  children
}: CircularProgressProps) {
  const [progress, setProgress] = useState(animated ? 0 : value);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (progress / max) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (!animated) {
      setProgress(value);
      return;
    }

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      setProgress(value * eased);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, animated, duration]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: duration / 1000, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ? (
          children
        ) : (
          <>
            {showValue && (
              <span
                className="text-2xl font-bold"
                style={{ color }}
              >
                {Math.round(progress)}
              </span>
            )}
            {label && (
              <span className="text-xs text-gray-500 mt-0.5">{label}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Category Score Icons Configuration
 */
export const CATEGORY_SCORE_CONFIG = {
  aptitude: {
    icon: Brain,
    color: '#2563EB',
    bgColor: '#DBEAFE',
    label: 'Aptitude'
  },
  passion: {
    icon: Heart,
    color: '#F97316',
    bgColor: '#FFF7ED',
    label: 'Passion'
  },
  service: {
    icon: Users,
    color: '#059669',
    bgColor: '#D1FAE5',
    label: 'Service'
  },
  identity: {
    icon: Sparkles,
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    label: 'Identity'
  },
} as const;

type CategoryKey = keyof typeof CATEGORY_SCORE_CONFIG;

/**
 * CategoryScoreRing - Circular progress with category icon
 */
export function CategoryScoreRing({
  category,
  score,
  size = 100
}: {
  category: CategoryKey;
  score: number;
  size?: number;
}) {
  const config = CATEGORY_SCORE_CONFIG[category];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <CircularProgress
          value={score}
          size={size}
          color={config.color}
          showValue={false}
        >
          <div className="flex flex-col items-center">
            <Icon
              size={size * 0.2}
              style={{ color: config.color }}
              className="mb-1"
            />
            <span
              className="text-xl font-bold"
              style={{ color: config.color }}
            >
              {Math.round(score)}
            </span>
          </div>
        </CircularProgress>
      </div>
      <span className="text-sm font-medium text-gray-700 mt-2">
        {config.label}
      </span>
    </div>
  );
}

/**
 * CategoryScoresQuadrant - 2x2 grid of category score rings
 */
export function CategoryScoresQuadrant({
  scores,
  size = 80
}: {
  scores: {
    aptitude: number;
    passion: number;
    service: number;
    identity: number;
  };
  size?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-6 p-4">
      <CategoryScoreRing category="aptitude" score={scores.aptitude} size={size} />
      <CategoryScoreRing category="passion" score={scores.passion} size={size} />
      <CategoryScoreRing category="service" score={scores.service} size={size} />
      <CategoryScoreRing category="identity" score={scores.identity} size={size} />
    </div>
  );
}

/**
 * OverallScoreRing - Large central score ring
 */
export function OverallScoreRing({
  score,
  label = 'Ivy+ Ready',
  size = 180
}: {
  score: number;
  label?: string;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center">
      <CircularProgress
        value={score}
        size={size}
        strokeWidth={14}
        color={BRAND_COLORS.secondary}
        showValue={false}
      >
        <div className="flex flex-col items-center">
          <span
            className="text-4xl font-bold"
            style={{ color: BRAND_COLORS.secondary }}
          >
            {Math.round(score)}
          </span>
          <span className="text-sm text-gray-500">{label}</span>
        </div>
      </CircularProgress>
    </div>
  );
}

export default CircularProgress;
