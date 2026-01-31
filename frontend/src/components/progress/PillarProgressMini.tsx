'use client';

/**
 * PillarProgressMini - Compact pillar progress for assessment header
 * Shows 4 mini pillar cards with wave-fill animations
 *
 * @version 2.0.0 (Phase 6 - Wave-fill SVG icons with confetti)
 */

import { motion } from 'framer-motion';
import { PILLARS, calculatePillarCompletion, type PillarId } from '@/lib/constants/pillars';
import { useStudentStore } from '@/lib/store';
import { WaveFillIcon } from './WaveFillIcon';
import { PillarConfetti, usePillarCompletionConfetti } from '@/components/effects/PillarConfetti';
import { useState, useEffect, useRef } from 'react';

const PILLAR_ICON_TYPES: Record<PillarId, 'fingerprint' | 'star' | 'heart' | 'users'> = {
  identity: 'fingerprint',
  aptitude: 'star',
  passion: 'heart',
  service: 'users',
};

interface PillarProgressMiniProps {
  className?: string;
  variant?: 'horizontal' | 'grid'; // horizontal = 4 in a row, grid = 2x2
}

export function PillarProgressMini({
  className = '',
  variant = 'horizontal'
}: PillarProgressMiniProps) {
  const profile = useStudentStore((s) => s.profile);

  const pillarOrder: PillarId[] = ['identity', 'aptitude', 'passion', 'service'];

  const completions = pillarOrder.map(pillarId => ({
    pillar: PILLARS[pillarId],
    completion: calculatePillarCompletion(pillarId, profile),
  }));

  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {completions.map(({ pillar, completion }) => (
          <PillarMiniCard key={pillar.id} pillar={pillar} completion={completion} />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {completions.map(({ pillar, completion }) => (
        <PillarMiniCard key={pillar.id} pillar={pillar} completion={completion} />
      ))}
    </div>
  );
}

interface PillarMiniCardProps {
  pillar: typeof PILLARS[PillarId];
  completion: number;
}

function PillarMiniCard({ pillar, completion }: PillarMiniCardProps) {
  const iconType = PILLAR_ICON_TYPES[pillar.id as PillarId];
  const previousCompletion = useRef(completion);
  const confettiTrigger = usePillarCompletionConfetti(previousCompletion.current, completion);

  // Update previous completion after confetti check
  useEffect(() => {
    previousCompletion.current = completion;
  }, [completion]);

  return (
    <>
      {/* Confetti celebration on 100% completion */}
      <PillarConfetti trigger={confettiTrigger} color={pillar.color} particleCount={30} />

      {/* Pillar card with wave-fill icon */}
      <motion.div
        className="relative overflow-hidden rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: pillar.bgLight,
          border: `1px solid ${pillar.color}40`,
          width: '64px',
          height: '64px',
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Wave-fill icon */}
        <WaveFillIcon
          completion={completion}
          color={pillar.color}
          size={64}
          iconType={iconType}
        />

        {/* Celebration pulse on 100% */}
        {completion >= 100 && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{
              border: `2px solid ${pillar.color}`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>
    </>
  );
}

export default PillarProgressMini;
