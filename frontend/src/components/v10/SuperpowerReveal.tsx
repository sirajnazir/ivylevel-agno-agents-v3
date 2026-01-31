/**
 * SuperpowerReveal Component
 * 6-phase animated reveal of CRI boost and Narrative DNA.
 * Used WITHIN Frame 5, not as a separate interstitial.
 * @version 10.0
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Sparkles } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';

interface SuperpowerRevealProps {
  baseScore: number;
  cri: number;
  constraints: string[];
  narrativeDna: string;
  archetype: string;
  onPhaseChange?: (phase: number) => void;
  onComplete?: () => void;
}

const CONSTRAINT_LABELS: Record<string, string> = {
  first_gen: 'First Generation',
  low_ses: 'Economic Background',
  family_duties: 'Family Responsibilities',
  underrepresented: 'Underrepresented Community',
  work_hours: 'Work Commitments',
  rural: 'Rural Location',
  immigrant: 'Immigrant Background',
  health_challenges: 'Health Journey',
};

const PHASES = [
  { id: 1, duration: 3000, name: 'category-scores' },
  { id: 2, duration: 2000, name: 'base-score' },
  { id: 3, duration: 2000, name: 'transition' },
  { id: 4, duration: 3000, name: 'cri-boost' },
  { id: 5, duration: 2000, name: 'narrative' },
  { id: 6, duration: 0, name: 'cta' },
];

export function SuperpowerReveal({
  baseScore,
  cri,
  constraints,
  narrativeDna,
  archetype,
  onPhaseChange,
  onComplete,
}: SuperpowerRevealProps) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [displayedScore, setDisplayedScore] = useState(0);
  const [showConstraints, setShowConstraints] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [showNarrative, setShowNarrative] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const criBoostPercentage = Math.round((cri - 1) * 100);
  const boostedScore = Math.round(baseScore * cri);

  // Animate score counting
  const animateScore = useCallback((from: number, to: number, duration: number) => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  // Phase progression
  useEffect(() => {
    if (currentPhase > PHASES.length) {
      setIsComplete(true);
      return;
    }

    const phase = PHASES[currentPhase - 1];
    onPhaseChange?.(currentPhase);

    switch (phase.name) {
      case 'base-score':
        animateScore(0, baseScore, 1500);
        break;
      case 'transition':
        setShowConstraints(true);
        break;
      case 'cri-boost':
        setShowBoost(true);
        animateScore(baseScore, boostedScore, 2000);
        break;
      case 'narrative':
        setShowNarrative(true);
        break;
      case 'cta':
        setIsComplete(true);
        return;
    }

    if (phase.duration > 0) {
      const timer = setTimeout(() => setCurrentPhase(p => p + 1), phase.duration);
      return () => clearTimeout(timer);
    }
  }, [currentPhase, baseScore, boostedScore, animateScore, onPhaseChange]);

  const skipToEnd = () => {
    setDisplayedScore(boostedScore);
    setShowConstraints(true);
    setShowBoost(true);
    setShowNarrative(true);
    setIsComplete(true);
    setCurrentPhase(PHASES.length + 1);
  };

  return (
    <div className="relative">
      {/* Skip Button */}
      {!isComplete && (
        <button
          onClick={skipToEnd}
          className="absolute top-0 right-0 text-sm text-gray-400 hover:text-gray-600 z-10"
        >
          Skip →
        </button>
      )}

      {/* Score Display */}
      <AnimatePresence>
        {currentPhase >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-6"
          >
            <span className="text-sm font-medium text-gray-500 block mb-1">
              Ivy+ Ready Score
            </span>
            <motion.span
              className={`text-6xl font-bold transition-colors duration-500 ${
                showBoost ? 'text-amber-600' : 'text-gray-800'
              }`}
              animate={{ scale: showBoost ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              {displayedScore}
            </motion.span>

            {/* CRI Boost Badge */}
            <AnimatePresence>
              {showBoost && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-300"
                >
                  <Zap size={18} className="text-amber-600" />
                  <span className="text-amber-700 font-bold text-lg">+{criBoostPercentage}%</span>
                  <span className="text-amber-600 text-sm">CRI Boost</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "But wait..." Transition */}
      <AnimatePresence>
        {showConstraints && !showBoost && constraints.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-xl font-medium mb-4"
            style={{ color: BRAND_COLORS.primary }}
          >
            But wait...
          </motion.p>
        )}
      </AnimatePresence>

      {/* Constraint Badges */}
      <AnimatePresence>
        {showConstraints && constraints.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap justify-center gap-2 mb-6"
          >
            {constraints.map((constraint, idx) => (
              <motion.span
                key={constraint}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="px-3 py-1.5 rounded-full text-sm font-medium border"
                style={{
                  backgroundColor: BRAND_COLORS.primaryBg,
                  borderColor: BRAND_COLORS.primary,
                  color: BRAND_COLORS.primary,
                }}
              >
                {CONSTRAINT_LABELS[constraint] || constraint}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CRI Explanation */}
      <AnimatePresence>
        {showBoost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 mb-6 border"
            style={{
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FFF7ED 100%)',
              borderColor: '#FCD34D',
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-amber-800 mb-1">
                  Your Constraints Became Superpowers!
                </h3>
                <p className="text-amber-700 text-sm">
                  Your unique background gives you a <strong>+{criBoostPercentage}%</strong> advantage. 
                  Top colleges actively seek students who've overcome challenges like yours.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narrative DNA */}
      <AnimatePresence>
        {showNarrative && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 mb-6 bg-white border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} style={{ color: BRAND_COLORS.identity }} />
              <span className="text-sm font-medium text-gray-500">Your Narrative DNA</span>
            </div>
            <p className="text-lg text-gray-800 italic mb-3">
              &ldquo;{narrativeDna}&rdquo;
            </p>
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: '#EDE9FE', color: BRAND_COLORS.identity }}
            >
              {archetype}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ready indicator */}
      {isComplete && onComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500">Ready to see your action plan</p>
        </motion.div>
      )}
    </div>
  );
}

export default SuperpowerReveal;
