/**
 * IvyScoreCard - Overall Ivy+ Readiness Score
 * v12.0 - Matches original frontend specification
 */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TIER_CONFIG, getTierFromScore, COLORS } from '@/lib/constants/design';

interface IvyScoreCardProps {
  score: number;
  changeVs180Days?: number;
  criMultiplier?: number;
}

export function IvyScoreCard({ score, changeVs180Days = 0, criMultiplier = 1.0 }: IvyScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const tier = getTierFromScore(score);
  const tierConfig = TIER_CONFIG[tier];

  // Animate score
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const TrendIcon = changeVs180Days > 0 ? TrendingUp : changeVs180Days < 0 ? TrendingDown : Minus;
  const trendColor = changeVs180Days > 0 ? COLORS.success : changeVs180Days < 0 ? COLORS.error : COLORS.textMuted;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-6 shadow-lg relative overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)' }}
    >
      {/* Background gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryAccent})` }}
      />

      <div className="flex items-start justify-between">
        {/* Score Section */}
        <div>
          <h3 className="text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
            Ivy+ Readiness Score
          </h3>
          <div className="flex items-baseline gap-2">
            <motion.span
              className="text-5xl font-bold"
              style={{ color: COLORS.textHeading }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {animatedScore}
            </motion.span>
            <span className="text-2xl font-medium" style={{ color: COLORS.textMuted }}>/100</span>
          </div>

          {/* Change indicator */}
          <div className="flex items-center gap-2 mt-2">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${trendColor}15`,
                color: trendColor,
              }}
            >
              <TrendIcon size={12} />
              {changeVs180Days > 0 ? '+' : ''}{changeVs180Days}%
            </div>
            <span className="text-xs" style={{ color: COLORS.textMuted }}>vs 180 days ago</span>
          </div>
        </div>

        {/* Tier Badge */}
        <div className="text-right">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              backgroundColor: `${tierConfig.color}20`,
              border: `2px solid ${tierConfig.color}`,
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: tierConfig.color }}
            />
            <span
              className="font-semibold text-sm"
              style={{ color: tierConfig.color }}
            >
              {tierConfig.label} Tier
            </span>
          </div>

          {/* CRI Multiplier */}
          {criMultiplier !== 1.0 && (
            <div className="mt-2 text-xs" style={{ color: COLORS.textMuted }}>
              CRI Multiplier: <span className="font-semibold">{criMultiplier.toFixed(1)}x</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default IvyScoreCard;
