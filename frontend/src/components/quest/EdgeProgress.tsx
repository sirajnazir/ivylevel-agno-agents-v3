'use client';

/**
 * EdgeProgress Component
 * Displays Edge points with animated counting and tier progression
 * @version 11.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, TrendingUp } from 'lucide-react';
import {
  EDGE_TERMS,
  EDGE_ANIMATION,
  getEdgeTier,
  getEdgeProgress,
  formatEdge,
  type EdgeTier
} from '@/lib/constants/edge';
import { BRAND_COLORS } from '@/lib/constants/brand';

interface EdgeProgressProps {
  points: number;
  variant?: 'full' | 'compact' | 'badge';
  showTier?: boolean;
  showProgress?: boolean;
  animated?: boolean;
}

export function EdgeProgress({
  points,
  variant = 'full',
  showTier = true,
  showProgress = true,
  animated = true
}: EdgeProgressProps) {
  const [displayedPoints, setDisplayedPoints] = useState(animated ? 0 : points);
  const tier = getEdgeTier(points);
  const { nextTier, progress, pointsToNext } = getEdgeProgress(points);

  // Animated counting effect
  useEffect(() => {
    if (!animated) {
      setDisplayedPoints(points);
      return;
    }

    const startTime = Date.now();
    const startValue = displayedPoints;
    const endValue = points;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / EDGE_ANIMATION.countDuration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      const currentValue = Math.round(startValue + (endValue - startValue) * eased);
      setDisplayedPoints(currentValue);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [points, animated]);

  // Badge variant - compact inline display
  if (variant === 'badge') {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        style={{
          backgroundColor: tier.bgColor,
          color: tier.color
        }}
      >
        <Zap size={14} />
        <span>{formatEdge(displayedPoints)} {EDGE_TERMS.singular}</span>
      </div>
    );
  }

  // Compact variant - small card
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: tier.bgColor }}
        >
          <Award size={20} style={{ color: tier.color }} />
        </div>
        <div>
          <motion.div
            key={displayedPoints}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold"
            style={{ color: tier.color }}
          >
            {formatEdge(displayedPoints)} {EDGE_TERMS.singular}
          </motion.div>
          {showTier && (
            <span className="text-xs text-gray-500">{tier.name}</span>
          )}
        </div>
      </div>
    );
  }

  // Full variant - detailed card with progress
  return (
    <div
      className="rounded-2xl border bg-white p-5"
      style={{ borderColor: '#E5E7EB' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: tier.bgColor }}
          >
            <Award size={24} style={{ color: tier.color }} />
          </div>
          <div>
            <span className="text-sm text-gray-500">Your {EDGE_TERMS.adjective}</span>
            <motion.div
              key={displayedPoints}
              initial={{ scale: 1.1, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold"
              style={{ color: tier.color }}
            >
              {formatEdge(displayedPoints)} {EDGE_TERMS.singular}
            </motion.div>
          </div>
        </div>

        {showTier && (
          <div
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              backgroundColor: tier.bgColor,
              color: tier.color
            }}
          >
            {tier.name}
          </div>
        )}
      </div>

      {/* Progress to next tier */}
      {showProgress && nextTier && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{tier.name}</span>
            <span>{nextTier.name}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: EDGE_ANIMATION.progressDuration / 1000 }}
              className="h-full rounded-full"
              style={{ backgroundColor: tier.color }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {pointsToNext} {EDGE_TERMS.singular} to {nextTier.name}
            </p>
            <p className="text-xs font-medium" style={{ color: tier.color }}>
              {progress}%
            </p>
          </div>
        </div>
      )}

      {/* Tier description */}
      {showTier && (
        <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
          {tier.description}
        </p>
      )}
    </div>
  );
}

/**
 * Frame Edge Progress - shows frame progress with Edge earned
 */
export function FrameEdgeProgress({
  frameNumber,
  totalFrames = 6,
  edgeEarned
}: {
  frameNumber: number;
  totalFrames?: number;
  edgeEarned: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          Frame {frameNumber} of {totalFrames}
        </span>
        <div className="flex gap-1">
          {[...Array(totalFrames)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < frameNumber ? 'bg-[#641432]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="h-4 w-px bg-gray-300" />
      <EdgeProgress points={edgeEarned} variant="badge" />
    </div>
  );
}

/**
 * Edge Gain Animation - shows when Edge is earned
 */
export function EdgeGainAnimation({
  amount,
  reason,
  onComplete
}: {
  amount: number;
  reason: string;
  onComplete?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      onAnimationComplete={onComplete}
      className="fixed bottom-24 right-6 z-50"
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
        style={{
          backgroundColor: '#FEF3C7',
          border: '2px solid #F59E0B'
        }}
      >
        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-bold text-amber-700">
            +{amount} {EDGE_TERMS.singular}
          </div>
          <div className="text-xs text-amber-600">{reason}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default EdgeProgress;
