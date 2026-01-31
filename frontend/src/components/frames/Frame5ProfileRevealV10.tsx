/**
 * Frame5ProfileReveal Component
 * Profile reveal with integrated 6-phase SuperpowerReveal animation.
 * CRI boost and Narrative DNA are WOVEN INTO this frame, not a separate screen.
 * @version 10.0
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, SkipForward } from 'lucide-react';
import { useSessionStore, useAgentDataCache, useViewMode } from '@/lib/store/useSessionStore';
import { getFeatureFlags } from '@/lib/config/featureFlags';
import { BRAND_COLORS, CATEGORY_CONFIG } from '@/lib/constants/brand';
import { SuperpowerReveal } from '@/components/v10/SuperpowerReveal';
import { extractConstraints } from '@/components/v10/V10EnhancedFlow';
import { SimpleCircularProgress } from '@/components/rings/SimpleCircularProgress';

interface Frame5ProfileRevealProps {
  onComplete: () => void;
  profile: any;
  scores: {
    overall: number;
    categories: {
      aptitude: number;
      passion: number;
      service: number;
      identity: number;
    };
  };
}

type RevealPhase = 'categories' | 'superpower' | 'complete';

export function Frame5ProfileReveal({ onComplete, profile, scores }: Frame5ProfileRevealProps) {
  const flags = getFeatureFlags();
  const viewMode = useViewMode();
  const agentData = useAgentDataCache();
  
  const [phase, setPhase] = useState<RevealPhase>('categories');
  const [categoriesComplete, setCategoriesComplete] = useState(false);
  const [superpowerComplete, setSuperpowerComplete] = useState(false);

  // Extract data for SuperpowerReveal
  const constraints = useMemo(() => extractConstraints(profile), [profile]);
  const cri = agentData.cri || 1.0;
  const narrativeDna = agentData.narrativeDna || generateFallbackNarrative(profile);
  const archetype = agentData.archetype || 'The Determined Achiever';

  // Determine if we should show superpower reveal
  const showSuperpowerReveal = flags.criScoring && (constraints.length > 0 || cri > 1.0);

  // Progress through phases
  useEffect(() => {
    if (categoriesComplete && !showSuperpowerReveal) {
      setPhase('complete');
    } else if (categoriesComplete && phase === 'categories') {
      setPhase('superpower');
    }
  }, [categoriesComplete, showSuperpowerReveal, phase]);

  useEffect(() => {
    if (superpowerComplete) {
      setPhase('complete');
    }
  }, [superpowerComplete]);

  // Auto-complete categories phase after animation
  useEffect(() => {
    if (phase === 'categories') {
      const timer = setTimeout(() => setCategoriesComplete(true), 3500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const skipToEnd = () => {
    setCategoriesComplete(true);
    setSuperpowerComplete(true);
    setPhase('complete');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-2"
            style={{ color: BRAND_COLORS.primary }}
          >
            {viewMode === 'parent' ? 'Your Child\'s Profile' : 'Your Profile Revealed'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: BRAND_COLORS.textSecondary }}
          >
            {phase === 'complete' 
              ? 'Here\'s where you stand' 
              : 'Analyzing your unique strengths...'}
          </motion.p>
        </div>

        {/* Skip Button */}
        {phase !== 'complete' && (
          <div className="flex justify-end mb-4">
            <button
              onClick={skipToEnd}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
            >
              <SkipForward size={14} />
              Skip animation
            </button>
          </div>
        )}

        {/* Main Card */}
        <motion.div
          layout
          className="rounded-2xl p-8 shadow-lg mb-6"
          style={{
            backgroundColor: BRAND_COLORS.bgPrimary,
            border: `1px solid ${BRAND_COLORS.borderLight}`,
          }}
        >
          {/* Phase 1: Category Scores */}
          <AnimatePresence mode="wait">
            {(phase === 'categories' || phase === 'complete') && (
              <motion.div
                key="categories"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                className="mb-8"
              >
                <CategoryScoreGrid 
                  scores={scores.categories} 
                  animate={phase === 'categories'}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 2: Superpower Reveal (CRI + Narrative) */}
          <AnimatePresence>
            {(phase === 'superpower' || (phase === 'complete' && showSuperpowerReveal)) && (
              <motion.div
                key="superpower"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: phase === 'complete' ? 0 : 0.3 }}
              >
                <SuperpowerReveal
                  baseScore={scores.overall}
                  cri={cri}
                  constraints={constraints}
                  narrativeDna={narrativeDna}
                  archetype={archetype}
                  onPhaseChange={(p) => console.log('Superpower phase:', p)}
                  onComplete={() => setSuperpowerComplete(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Non-CRI fallback: Simple score display */}
          {phase === 'complete' && !showSuperpowerReveal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <span className="text-sm font-medium text-gray-500 block mb-1">
                Ivy+ Ready Score
              </span>
              <span className="text-6xl font-bold" style={{ color: BRAND_COLORS.primary }}>
                {scores.overall}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Continue Button */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={onComplete}
                className="w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: BRAND_COLORS.primary, color: 'white' }}
              >
                See Your Top 3 Actions
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface CategoryScoreGridProps {
  scores: {
    aptitude: number;
    passion: number;
    service: number;
    identity: number;
  };
  animate: boolean;
}

function CategoryScoreGrid({ scores, animate }: CategoryScoreGridProps) {
  const categories = ['aptitude', 'passion', 'service', 'identity'] as const;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((cat, idx) => {
        const config = CATEGORY_CONFIG[cat];
        return (
          <motion.div
            key={cat}
            initial={animate ? { opacity: 0, scale: 0.8 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: animate ? idx * 0.2 : 0 }}
            className="flex flex-col items-center"
          >
            <SimpleCircularProgress
              value={scores[cat]}
              max={100}
              size={80}
              strokeWidth={6}
              color={config.color}
              animated={animate}
              label={config.label.slice(0, 3)}
            />
            <span className="text-xs font-medium mt-2" style={{ color: config.color }}>
              {config.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// Fallback narrative when agent unavailable
function generateFallbackNarrative(profile: any): string {
  const name = profile?.identity?.name || 'This student';
  const hasLeadership = (profile?.passion?.leadership_level || 0) >= 3;
  const isFirstGen = profile?.demographics?.first_gen;
  
  if (isFirstGen && hasLeadership) {
    return `${name} is a pioneering leader charting new paths for their family and community.`;
  } else if (isFirstGen) {
    return `${name} is breaking barriers and creating new possibilities as a first-generation trailblazer.`;
  } else if (hasLeadership) {
    return `${name} demonstrates natural leadership and the drive to create meaningful impact.`;
  }
  
  return `${name} brings a unique perspective and genuine passion to their academic journey.`;
}

export default Frame5ProfileReveal;
