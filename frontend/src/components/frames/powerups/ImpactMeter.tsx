/**
 * ImpactMeter Component
 * Visual representation of current vs projected score improvement
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { ImpactMeterProps } from '@/lib/types/frame5.types';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ImpactMeter({
  label,
  currentScore,
  projectedScore,
  maxScore = 100,
  color = '#3B82F6',
}: ImpactMeterProps) {
  const improvement = projectedScore - currentScore;
  const currentPercentage = (currentScore / maxScore) * 100;
  const projectedPercentage = (projectedScore / maxScore) * 100;
  const improvementPercentage = ((projectedScore - currentScore) / maxScore) * 100;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-muted">{currentScore}</span>
          {improvement > 0 && (
            <>
              <span className="text-text-muted">→</span>
              <span className="font-semibold" style={{ color }}>
                {projectedScore}
              </span>
              <span className="text-success-green text-xs font-medium">
                (+{improvement.toFixed(1)})
              </span>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-background-secondary rounded-full overflow-hidden">
        {/* Current Score */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color, opacity: 0.4 }}
          initial={{ width: 0 }}
          animate={{ width: `${currentPercentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        {/* Improvement Area */}
        {improvement > 0 && (
          <motion.div
            className="absolute inset-y-0 rounded-r-full"
            style={{
              backgroundColor: color,
              left: `${currentPercentage}%`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${improvementPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />
        )}

        {/* Projected Score Marker */}
        {improvement > 0 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-white shadow-md"
            style={{ left: `${projectedPercentage}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSITE IMPACT DISPLAY
// ============================================================================

interface ImpactSummaryProps {
  currentScores: {
    aptitude: number;
    passion: number;
    community: number;
    operating: number;
    ivyReady: number;
  };
  projectedScores: {
    aptitude: number;
    passion: number;
    community: number;
    operating: number;
    ivyReady: number;
  } | null;
}

const LAYER_CONFIG = [
  { key: 'aptitude', label: 'Aptitude', color: '#3B82F6' },
  { key: 'passion', label: 'Passion', color: '#F59E0B' },
  { key: 'community', label: 'Community', color: '#10B981' },
  { key: 'operating', label: 'Operating', color: '#8B5CF6' },
] as const;

export function ImpactSummary({ currentScores, projectedScores }: ImpactSummaryProps) {
  const totalImprovement = projectedScores
    ? projectedScores.ivyReady - currentScores.ivyReady
    : 0;

  return (
    <div className="space-y-6">
      {/* Ivy+ Ready Score */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary-blue/20 to-primary-blue/5 border border-primary-blue/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-text-primary">Ivy+ Ready Score</h3>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-text-primary">
              {currentScores.ivyReady}
            </span>
            {projectedScores && totalImprovement > 0 && (
              <>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl text-text-muted"
                >
                  →
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-3xl font-bold text-primary-blue"
                >
                  {projectedScores.ivyReady}
                </motion.span>
              </>
            )}
          </div>
        </div>

        {projectedScores && totalImprovement > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-success-green"
          >
            <span className="text-xl font-bold">+{totalImprovement.toFixed(1)}</span>
            <span className="text-sm">points projected improvement</span>
          </motion.div>
        )}
      </div>

      {/* Layer Breakdown */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-text-muted uppercase tracking-wide">
          Category Breakdown
        </h4>
        {LAYER_CONFIG.map(({ key, label, color }) => (
          <ImpactMeter
            key={key}
            label={label}
            currentScore={currentScores[key]}
            projectedScore={projectedScores?.[key] ?? currentScores[key]}
            color={color}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MINI IMPACT BADGE
// ============================================================================

interface ImpactBadgeProps {
  impact: number;
  size?: 'sm' | 'md' | 'lg';
  showSign?: boolean;
}

export function ImpactBadge({ impact, size = 'md', showSign = true }: ImpactBadgeProps) {
  const isPositive = impact > 0;
  const isNegative = impact < 0;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        sizeClasses[size],
        isPositive && 'bg-success-green/20 text-success-green',
        isNegative && 'bg-error-red/20 text-error-red',
        !isPositive && !isNegative && 'bg-text-muted/20 text-text-muted'
      )}
    >
      {showSign && isPositive && '+'}
      {impact.toFixed(1)}
    </span>
  );
}

export default ImpactMeter;
