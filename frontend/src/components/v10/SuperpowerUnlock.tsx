/**
 * IvyQuest v10.0 - Superpower Unlock Component
 * =============================================
 * Displays after Frame 3 to reveal how constraints become superpowers.
 *
 * Shows:
 * - Pyramid visualization (constraints at base → growth → success at apex)
 * - CRI boost percentage
 * - Narrative DNA synthesis
 *
 * Per v9.1: This is the "12-second moment" where scattered interests crystallize.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Shield, TrendingUp, Star } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';

interface SuperpowerUnlockProps {
  constraints: string[];
  cri: number;
  narrativeDna: string;
  narrativeThemes?: string[];
  archetypeLabel?: string;
  onContinue: () => void;
}

export function SuperpowerUnlock({
  constraints,
  cri,
  narrativeDna,
  narrativeThemes = [],
  archetypeLabel,
  onContinue,
}: SuperpowerUnlockProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Calculate CRI boost percentage
  const criBoost = Math.round((cri - 1) * 100);
  const criStatus = criBoost >= 20 ? 'exceptional' : criBoost >= 10 ? 'strong' : 'baseline';

  // Animate through reveal steps
  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStep(1), 500),   // Show pyramid base
      setTimeout(() => setCurrentStep(2), 1500),  // Show middle
      setTimeout(() => setCurrentStep(3), 2500),  // Show apex
      setTimeout(() => setCurrentStep(4), 3500),  // Show CRI
      setTimeout(() => setCurrentStep(5), 4500),  // Show narrative
      setTimeout(() => setIsRevealed(true), 5500), // Enable continue
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  // Map constraint labels to display names
  const getConstraintLabel = (constraint: string): string => {
    const labels: Record<string, string> = {
      family_duties: 'Family Responsibilities',
      low_ses: 'Economic Background',
      underrepresented: 'Underrepresented Community',
      first_gen: 'First Generation',
      work_hours: 'Work Commitments',
      rural: 'Rural Location',
      immigrant: 'Immigrant Background',
      neurodiverse: 'Unique Learning Style',
      health_challenges: 'Health Journey',
      single_parent: 'Single Parent Household',
      limited_resources: 'Resource Constraints',
      language_barrier: 'Multilingual Journey',
    };
    return labels[constraint.toLowerCase().replace(' ', '_')] || constraint;
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8"
      style={{ backgroundColor: BRAND_COLORS.bgPage }}
    >
      <div className="max-w-2xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: BRAND_COLORS.primaryBg }}
          >
            <Sparkles size={32} style={{ color: BRAND_COLORS.primary }} />
          </motion.div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ color: BRAND_COLORS.secondary }}
          >
            Your Barriers Are Your Superpowers
          </h1>
          <p style={{ color: BRAND_COLORS.textSecondary }}>
            What others see as obstacles, admissions officers see as strength
          </p>
        </motion.div>

        {/* Pyramid Visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative w-full max-w-md mx-auto mb-8"
        >
          <svg viewBox="0 0 400 300" className="w-full">
            {/* Base - Constraints */}
            <motion.g
              initial={{ opacity: 0, y: 20 }}
              animate={currentStep >= 1 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <polygon
                points="40,280 360,280 280,180 120,180"
                fill={BRAND_COLORS.secondary}
                stroke="white"
                strokeWidth="2"
              />
              <Shield
                x="180"
                y="210"
                width="40"
                height="40"
                color="white"
                opacity={0.8}
              />
              <text
                x="200"
                y="260"
                fill="white"
                textAnchor="middle"
                fontSize="12"
                fontWeight="500"
              >
                {constraints.length > 0
                  ? constraints.slice(0, 2).map(getConstraintLabel).join(' • ')
                  : 'Your Foundation'}
              </text>
            </motion.g>

            {/* Middle - Growth */}
            <motion.g
              initial={{ opacity: 0, y: 20 }}
              animate={currentStep >= 2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <polygon
                points="120,180 280,180 240,100 160,100"
                fill={BRAND_COLORS.primary}
                stroke="white"
                strokeWidth="2"
              />
              <TrendingUp
                x="180"
                y="120"
                width="40"
                height="40"
                color="white"
                opacity={0.9}
              />
              <text
                x="200"
                y="160"
                fill="white"
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
              >
                GROWTH
              </text>
            </motion.g>

            {/* Apex - Success */}
            <motion.g
              initial={{ opacity: 0, y: 20 }}
              animate={currentStep >= 3 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <polygon
                points="160,100 240,100 200,30"
                fill={BRAND_COLORS.success}
                stroke="white"
                strokeWidth="2"
              />
              <Star
                x="185"
                y="50"
                width="30"
                height="30"
                color="white"
                fill="white"
              />
            </motion.g>

            {/* Glow effect on apex */}
            <AnimatePresence>
              {currentStep >= 3 && (
                <motion.circle
                  cx="200"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={BRAND_COLORS.success}
                  strokeWidth="2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </AnimatePresence>
          </svg>
        </motion.div>

        {/* CRI Boost Display */}
        <AnimatePresence>
          {currentStep >= 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-6 mb-6 text-center"
              style={{
                backgroundColor: BRAND_COLORS.bgPrimary,
                border: `1px solid ${BRAND_COLORS.borderLight}`,
                boxShadow: BRAND_COLORS.shadowCard,
              }}
            >
              <p
                className="text-sm uppercase tracking-wider mb-2"
                style={{ color: BRAND_COLORS.textMuted }}
              >
                Context Relativity Index
              </p>
              <motion.p
                className="text-5xl md:text-6xl font-bold mb-2"
                style={{
                  color:
                    criStatus === 'exceptional'
                      ? BRAND_COLORS.success
                      : criStatus === 'strong'
                      ? BRAND_COLORS.primary
                      : BRAND_COLORS.textPrimary,
                }}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {criBoost > 0 ? '+' : ''}
                {criBoost}%
              </motion.p>
              <p style={{ color: BRAND_COLORS.textSecondary }} className="text-sm">
                {criBoost >= 20
                  ? 'Your barriers significantly boost your application strength'
                  : criBoost >= 10
                  ? 'Your context adds meaningful depth to your story'
                  : 'Building from a solid foundation'}
              </p>

              {/* CRI breakdown */}
              <div className="mt-4 flex justify-center gap-4 text-sm">
                <div
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: BRAND_COLORS.bgSuccess }}
                >
                  <span style={{ color: BRAND_COLORS.success }}>
                    CRI: {cri.toFixed(2)}
                  </span>
                </div>
                {archetypeLabel && (
                  <div
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: BRAND_COLORS.primaryBg }}
                  >
                    <span style={{ color: BRAND_COLORS.primary }}>
                      {archetypeLabel}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Narrative DNA */}
        <AnimatePresence>
          {currentStep >= 5 && narrativeDna && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <p
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: BRAND_COLORS.textMuted }}
              >
                Your Narrative DNA
              </p>
              <p
                className="text-xl md:text-2xl italic font-medium"
                style={{ color: BRAND_COLORS.secondary }}
              >
                "{narrativeDna}"
              </p>

              {narrativeThemes.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {narrativeThemes.slice(0, 4).map((theme, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: BRAND_COLORS.bgPill,
                        color: BRAND_COLORS.textSecondary,
                      }}
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Button */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <button
                onClick={onContinue}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold transition-all"
                style={{
                  backgroundColor: BRAND_COLORS.primary,
                  color: 'white',
                  boxShadow: BRAND_COLORS.shadowPrimary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = BRAND_COLORS.shadowPrimaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = BRAND_COLORS.shadowPrimary;
                }}
              >
                Forge Your Story
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SuperpowerUnlock;
