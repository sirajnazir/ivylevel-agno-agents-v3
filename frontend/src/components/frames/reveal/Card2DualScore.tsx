'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { LAUNCH_TIMINGS, SCORE_BENCHMARKS, REVEAL_COLORS, EASING } from '@/lib/constants/frame4.constants';
import type { IvyReadyScore, MarketReality } from '@/lib/types/frame4.types';
import { Trophy, Target, TrendingUp, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface Card2DualScoreProps {
  ivyReadyScore: IvyReadyScore;
  marketReality: MarketReality;
  schoolCount: number;
  onComplete: () => void;
}

export function Card2DualScore({
  ivyReadyScore,
  marketReality,
  schoolCount,
  onComplete,
}: Card2DualScoreProps) {
  const [profileAnimated, setProfileAnimated] = useState(false);
  const [marketAnimated, setMarketAnimated] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(false);

  // Animation sequence
  useEffect(() => {
    // Profile strength animates first
    const profileTimer = setTimeout(() => {
      setProfileAnimated(true);
    }, 100);

    // Market reality animates second
    const marketTimer = setTimeout(() => {
      setMarketAnimated(true);
    }, LAUNCH_TIMINGS.scoreAnimation + 300);

    // Labels fade in after
    const labelTimer = setTimeout(() => {
      setLabelsVisible(true);
    }, LAUNCH_TIMINGS.scoreAnimation + LAUNCH_TIMINGS.marketAnimation + 300);

    return () => {
      clearTimeout(profileTimer);
      clearTimeout(marketTimer);
      clearTimeout(labelTimer);
    };
  }, []);

  // Get tier color
  const getTierColor = () => {
    switch (ivyReadyScore.tier) {
      case 'exceptional':
        return REVEAL_COLORS.exceptional;
      case 'competitive':
        return REVEAL_COLORS.competitive;
      case 'average':
        return REVEAL_COLORS.average;
      default:
        return REVEAL_COLORS.below;
    }
  };

  // Get fit label color
  const getFitColor = () => {
    switch (marketReality.label) {
      case 'safety':
        return REVEAL_COLORS.safety;
      case 'target':
        return REVEAL_COLORS.target;
      default:
        return REVEAL_COLORS.reach;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full space-y-6"
    >
      {/* Profile Strength Section */}
      <Card padding="lg">
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-warning-amber" />
            <h3 className="text-lg font-semibold text-text-primary">Profile Strength</h3>
            <span className="text-xs text-text-muted ml-auto">Ivy+ Ready Score</span>
          </div>

          {/* Score Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              {/* Background ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-background-secondary"
                />
                {/* Animated progress ring */}
                <motion.circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke={getTierColor()}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={502.4} // 2 * PI * 80
                  initial={{ strokeDashoffset: 502.4 }}
                  animate={{
                    strokeDashoffset: profileAnimated
                      ? 502.4 - (502.4 * ivyReadyScore.total) / 100
                      : 502.4,
                  }}
                  transition={{
                    duration: LAUNCH_TIMINGS.scoreAnimation / 1000,
                    ease: EASING.scoreReveal as unknown as string,
                  }}
                />
              </svg>

              {/* Score number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-5xl font-display font-bold"
                  style={{ color: getTierColor() }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: profileAnimated ? 1 : 0,
                    scale: profileAnimated ? 1 : 0.5,
                  }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  {ivyReadyScore.total}
                </motion.span>
                <motion.span
                  className="text-sm text-text-muted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: profileAnimated ? 1 : 0 }}
                  transition={{ delay: 0.7 }}
                >
                  out of 100
                </motion.span>
              </div>
            </div>

            {/* Tier label */}
            <AnimatePresence>
              {labelsVisible && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: getTierColor() }}
                  >
                    {ivyReadyScore.tier.charAt(0).toUpperCase() + ivyReadyScore.tier.slice(1)} Range
                  </span>
                  <span className="text-sm text-text-secondary">
                    Top {100 - ivyReadyScore.percentile}% of applicants
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Benchmarks */}
          <div className="mt-6 flex justify-between px-4">
            {SCORE_BENCHMARKS.map((benchmark) => (
              <div
                key={benchmark.value}
                className={cn(
                  'text-center',
                  ivyReadyScore.total >= benchmark.value
                    ? 'text-text-primary'
                    : 'text-text-muted'
                )}
              >
                <div className="text-sm font-medium">{benchmark.value}</div>
                <div className="text-xs">{benchmark.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Reality Section */}
      <Card padding="lg">
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-primary-blue" />
            <h3 className="text-lg font-semibold text-text-primary">Market Reality</h3>
            <span className="text-xs text-text-muted ml-auto">RS Rubric Probability</span>
          </div>

          {/* Probability range bar */}
          <div className="relative">
            {/* Bar background */}
            <div className="h-8 bg-background-secondary rounded-full overflow-hidden">
              {/* Animated fill */}
              <motion.div
                className="h-full rounded-full relative"
                style={{ backgroundColor: getFitColor() }}
                initial={{ width: 0 }}
                animate={{
                  width: marketAnimated ? `${(marketReality.min + marketReality.max) / 2}%` : 0,
                }}
                transition={{
                  duration: LAUNCH_TIMINGS.marketAnimation / 1000,
                  ease: EASING.scoreReveal as unknown as string,
                  delay: LAUNCH_TIMINGS.scoreAnimation / 1000,
                }}
              />
            </div>

            {/* Range markers */}
            <AnimatePresence>
              {marketAnimated && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="text-lg font-bold text-white drop-shadow-md">
                    {marketReality.min}% - {marketReality.max}%
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fit label and context */}
          <AnimatePresence>
            {labelsVisible && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-white capitalize"
                    style={{ backgroundColor: getFitColor() }}
                  >
                    {marketReality.label}
                  </span>
                  <span className="text-sm text-text-secondary flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Across {schoolCount} schools
                  </span>
                </div>

                {/* Context message */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-background-secondary">
                  <Info className="w-4 h-4 text-primary-blue mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-text-secondary">
                    Students with your profile have a{' '}
                    <span className="font-semibold text-text-primary">
                      {marketReality.min}-{marketReality.max}%
                    </span>{' '}
                    probability range at your target schools. This is based on research-backed data
                    including Chetty 2023 and CDS 2025.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Continue button area handled by parent */}
    </motion.div>
  );
}

export default Card2DualScore;
