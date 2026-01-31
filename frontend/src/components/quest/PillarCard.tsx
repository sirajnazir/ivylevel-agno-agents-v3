/**
 * PillarCard - Animated Wave Score Card
 * v12.0 - Matches original frontend specification
 */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PILLAR_CONFIG, GRADIENTS, getTierFromScore, TIER_CONFIG } from '@/lib/constants/design';

export interface PillarCardProps {
  pillar: 'aptitude' | 'passion' | 'service' | 'identity';
  score: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PillarCard({ pillar, score, showDetails = false, size = 'md' }: PillarCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = PILLAR_CONFIG[pillar];
  const tier = getTierFromScore(score);

  // Animate score on mount
  useEffect(() => {
    const duration = 1500;
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

  const sizeConfig = {
    sm: { width: 140, height: 160, fontSize: 32 },
    md: { width: 180, height: 200, fontSize: 42 },
    lg: { width: 220, height: 240, fontSize: 52 },
  }[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        width: sizeConfig.width,
        height: sizeConfig.height,
        background: config.gradient,
      }}
    >
      {/* Animated Wave Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-0 left-0 right-0 h-3/4"
          style={{
            background: `linear-gradient(to top, rgba(255,255,255,0.4), transparent)`,
            borderRadius: '100% 100% 0 0',
          }}
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 5, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute bottom-0 left-0 right-0 h-2/3"
          style={{
            background: `linear-gradient(to top, rgba(255,255,255,0.3), transparent)`,
            borderRadius: '80% 100% 0 0',
          }}
        />
        <motion.div
          animate={{
            y: [0, -8, 0],
            x: [0, -5, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-0 left-0 right-0 h-1/2"
          style={{
            background: `linear-gradient(to top, rgba(255,255,255,0.2), transparent)`,
            borderRadius: '120% 80% 0 0',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-white">
        {/* Label */}
        <span className="text-sm font-medium opacity-90 mb-1">{config.label}</span>

        {/* Score */}
        <motion.div
          className="font-bold"
          style={{ fontSize: sizeConfig.fontSize }}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          {animatedScore}%
        </motion.div>

        {/* Tier Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-2 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: 'rgba(255,255,255,0.25)',
            color: 'white',
          }}
        >
          {TIER_CONFIG[tier].label}
        </motion.div>

        {/* Description (optional) */}
        {showDetails && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-2 text-xs text-center opacity-75 px-2"
          >
            {config.description}
          </motion.p>
        )}
      </div>

      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: '200%', opacity: [0, 0.3, 0] }}
        transition={{
          duration: 2,
          delay: 0.5,
          ease: 'easeInOut',
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          transform: 'skewX(-20deg)',
        }}
      />
    </motion.div>
  );
}

// Grid layout for all 4 pillars
export interface PillarScoresGridProps {
  scores: {
    aptitude: number;
    passion: number;
    service: number;
    identity: number;
  };
  size?: 'sm' | 'md' | 'lg';
}

export function PillarScoresGrid({ scores, size = 'md' }: PillarScoresGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">
      <PillarCard pillar="aptitude" score={scores.aptitude} size={size} />
      <PillarCard pillar="passion" score={scores.passion} size={size} />
      <PillarCard pillar="service" score={scores.service} size={size} />
      <PillarCard pillar="identity" score={scores.identity} size={size} />
    </div>
  );
}

export default PillarCard;
