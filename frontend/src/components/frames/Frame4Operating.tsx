/**
 * IvyQuest v3.0 — Frame 4: Operating
 *
 * STYLING: Uses BRAND_COLORS constants for consistent Ivylevel branding.
 * Never use dark-mode Tailwind classes (text-text-primary, bg-background-secondary, etc.)
 *
 * @version 2.0.0
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useFrame3Store, useStudentStore, useSessionStore } from '@/lib/store';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { IconBook, IconTarget, IconUser } from '@/components/icons';
import type { AuraState } from '@/lib/types/frame3.types';

// Card components
import {
  Card0Interests,
  Card1Scenarios,
  Card2TimeEnergy,
  Card3HiddenCapabilities,
  Card4Demographics,
  Card5Context,
  Card6Challenges,
} from './operating';

// ============================================================================
// HUD COMPONENT
// ============================================================================

interface HUDProps {
  aptitudeScore: number;
  passionScore: number;
  communityScore: number;
  aura: AuraState;
  currentCard: number;
}

const HUD: React.FC<HUDProps> = ({
  aptitudeScore,
  passionScore,
  communityScore,
  aura,
  currentCard,
}) => {
  const calibrationStatus = aura.isCalibrated
    ? '✓ calibrated'
    : `calibrating... ${Math.round(aura.intensity)}%`;

  return (
    <div
      className="w-full backdrop-blur-sm py-3 px-4"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderBottom: `1px solid ${BRAND_COLORS.borderLight}`,
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Score badges */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ backgroundColor: BRAND_COLORS.primaryBg, color: BRAND_COLORS.primary }}
          >
            <IconBook size={16} color={BRAND_COLORS.primary} />
            <span>Aptitude: {aptitudeScore}%</span>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ backgroundColor: BRAND_COLORS.secondaryBg, color: BRAND_COLORS.secondary }}
          >
            <IconTarget size={16} color={BRAND_COLORS.secondary} />
            <span>Passion: {passionScore}%</span>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ backgroundColor: BRAND_COLORS.bgSuccess, color: BRAND_COLORS.success }}
          >
            <IconUser size={16} color={BRAND_COLORS.success} />
            <span>Community: {communityScore}%</span>
          </div>
        </div>

        {/* Twin aura status */}
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>Twin:</span>
          <div className="flex items-center gap-2">
            {/* Aura indicator */}
            <motion.div
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: aura.color,
                boxShadow: `0 0 ${aura.glowRadius}px ${aura.color}`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration:
                  aura.pulseSpeed === 'slow'
                    ? 3
                    : aura.pulseSpeed === 'medium'
                      ? 2
                      : aura.pulseSpeed === 'fast'
                        ? 1
                        : 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <span className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
              Aura {calibrationStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FRAME PROGRESS INDICATOR
// ============================================================================

interface FrameProgressProps {
  currentFrame: number;
}

const FrameProgress: React.FC<FrameProgressProps> = ({ currentFrame }) => {
  const frameLabels = ['Warm-up', 'Snapshot', 'Building', 'Operating', 'Reveal', 'Power'];

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {frameLabels.map((label, index) => {
        const frameIndex = index + 1;
        const isActive = frameIndex === currentFrame;
        const isPast = frameIndex < currentFrame;

        return (
          <div key={label} className="flex items-center">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: isActive ? BRAND_COLORS.primaryBg : 'transparent',
                color: isActive
                  ? BRAND_COLORS.primary
                  : isPast
                    ? BRAND_COLORS.textMuted
                    : BRAND_COLORS.textDisabled,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: isActive
                    ? BRAND_COLORS.primary
                    : isPast
                      ? BRAND_COLORS.textMuted
                      : BRAND_COLORS.borderLight,
                }}
              />
              <span className="hidden md:inline">{label}</span>
            </div>
            {index < frameLabels.length - 1 && (
              <div
                className="w-4 h-px mx-1"
                style={{ backgroundColor: BRAND_COLORS.borderLight }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// TWIN AURA VISUALIZATION
// ============================================================================

interface TwinAuraProps {
  aura: AuraState;
}

const TwinAura: React.FC<TwinAuraProps> = ({ aura }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Background aura glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: aura.color }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration:
            aura.pulseSpeed === 'slow'
              ? 4
              : aura.pulseSpeed === 'medium'
                ? 3
                : aura.pulseSpeed === 'fast'
                  ? 2
                  : 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Core aura */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full"
        style={{
          backgroundColor: aura.color,
          boxShadow: `0 0 ${aura.glowRadius * 2}px ${aura.color}`,
          opacity: (aura.intensity / 100) * 0.3,
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

// ============================================================================
// CARD TRANSITION VARIANTS
// ============================================================================

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface Frame4Props {
  onComplete: () => void;
}

export function Frame4Operating({ onComplete }: Frame4Props) {
  // Stores
  const {
    frame3Data,
    frame3Signals,
    frame3Validation,
    frame3CurrentCard,
    setScenarioResponse,
    setWeeklyHours,
    setPeakProductivity,
    setEnergySource,
    toggleHiddenCapability,
    setFrame3Card,
    nextFrame3Card,
    prevFrame3Card,
    recalculateFrame3Signals,
    completeFrame3,
  } = useFrame3Store();

  const { setPsychometrics, setAssessmentIntelligence } = useStudentStore();
  const { startFrame, completeFrame, prevFrame } = useSessionStore();

  // Track transition direction
  const [[direction, prevCard], setDirection] = React.useState([0, frame3CurrentCard]);

  // Initialize frame on mount
  useEffect(() => {
    startFrame(4, 7); // 🆕 Updated from 6 to 7 cards
  }, [startFrame]);

  // Track direction for animations
  useEffect(() => {
    if (frame3CurrentCard !== prevCard) {
      setDirection([frame3CurrentCard > prevCard ? 1 : -1, frame3CurrentCard]);
    }
  }, [frame3CurrentCard, prevCard]);

  // Recalculate signals when data changes
  useEffect(() => {
    recalculateFrame3Signals();
  }, [frame3Data, recalculateFrame3Signals]);

  // Handlers
  const handleCard0Continue = useCallback(() => {
    nextFrame3Card();
  }, [nextFrame3Card]);

  const handleCard1Continue = useCallback(() => {
    nextFrame3Card();
  }, [nextFrame3Card]);

  const handleCard2Continue = useCallback(() => {
    nextFrame3Card();
  }, [nextFrame3Card]);

  const handleCard3Continue = useCallback(() => {
    nextFrame3Card();
  }, [nextFrame3Card]);

  const handleCard4Continue = useCallback(() => {
    nextFrame3Card();
  }, [nextFrame3Card]);

  const handleCard5Continue = useCallback(() => {
    nextFrame3Card();
  }, [nextFrame3Card]);

  const handleCard6Complete = useCallback(() => {
    // Complete Frame 3 and save signals
    completeFrame3();
    completeFrame();

    // Update student store with psychometrics
    const signals = useFrame3Store.getState().frame3Signals;

    setPsychometrics({
      coachability_score:
        signals.operatingStyle === 'organized_collaborator' ||
          signals.operatingStyle === 'dynamic_leader'
          ? 0.8
          : 0.6,
      introversion_extroversion:
        signals.energyPattern === 'deep_focus'
          ? -0.8
          : signals.energyPattern === 'independent_thinker'
            ? -0.4
            : signals.energyPattern === 'balanced'
              ? 0
              : signals.energyPattern === 'team_oriented'
                ? 0.4
                : 0.8,
      openness:
        signals.riskTolerance === 'bold'
          ? 0.8
          : signals.riskTolerance === 'cautious'
            ? 0.5
            : 0.65,
      conscientiousness:
        signals.stressResponse === 'systematic'
          ? 0.85
          : signals.stressResponse === 'adaptive'
            ? 0.6
            : 0.7,
    });

    setAssessmentIntelligence({
      hidden_capabilities: {
        hidden_technical_projects: signals.hiddenStrengths.capabilities.filter(
          (c) => c === 'technical_build' || c === 'data_analysis'
        ),
        hobby_passions: signals.hiddenStrengths.capabilities.filter(
          (c) => c === 'creative_design' || c === 'writing' || c === 'idea_generation'
        ),
        unconventional_interests: signals.hiddenStrengths.capabilities,
      },
    });

    onComplete();
  }, [completeFrame3, completeFrame, setPsychometrics, setAssessmentIntelligence, onComplete]);

  const handleBack = useCallback(() => {
    if (frame3CurrentCard === 1) {
      return;
    }
    prevFrame3Card();
  }, [frame3CurrentCard, prevFrame3Card]);

  const aptitudeScore = 0;
  const passionScore = 0;
  const communityScore = 0;

  const renderCard = () => {
    switch (frame3CurrentCard) {
      case 1:
        return (
          <Card0Interests
            onNext={handleCard0Continue}
            onPrev={prevFrame}
            currentCard={0}
            totalCards={7}
          />
        );
      case 2:
        return (
          <Card1Scenarios
            scenarioResponses={frame3Data.scenarioResponses}
            onScenarioSelect={setScenarioResponse}
            onContinue={handleCard1Continue}
            onBack={handleBack}
            validation={frame3Validation.card1}
          />
        );
      case 3:
        return (
          <Card2TimeEnergy
            weeklyHours={frame3Data.weeklyAvailableHours}
            peakProductivity={frame3Data.peakProductivity}
            energySource={frame3Data.energySource}
            onWeeklyHoursSelect={setWeeklyHours}
            onProductivitySelect={setPeakProductivity}
            onEnergyChange={setEnergySource}
            onContinue={handleCard2Continue}
            onBack={handleBack}
            validation={frame3Validation.card2}
          />
        );
      case 4:
        return (
          <Card3HiddenCapabilities
            hiddenCapabilities={frame3Data.hiddenCapabilities}
            onCapabilityToggle={toggleHiddenCapability}
            onComplete={handleCard3Continue}
            onBack={handleBack}
            validation={frame3Validation.card3}
          />
        );
      case 5:
        return (
          <Card4Demographics
            onNext={handleCard4Continue}
            onPrev={handleBack}
            currentCard={4}
            totalCards={7}
          />
        );
      case 6:
        return (
          <Card5Context
            onNext={handleCard5Continue}
            onPrev={handleBack}
            currentCard={5}
            totalCards={7}
          />
        );
      case 7:
        return (
          <Card6Challenges
            onNext={handleCard6Complete}
            onPrev={handleBack}
            currentCard={6}
            totalCards={7}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(135deg, #fdf2f0 0%, #fff5f3 50%, #fef7f5 100%)',
        color: BRAND_COLORS.textHeading,
      }}
    >
      {/* Twin aura background */}
      <TwinAura aura={frame3Signals.aura} />

      {/* HUD */}
      <HUD
        aptitudeScore={aptitudeScore}
        passionScore={passionScore}
        communityScore={communityScore}
        aura={frame3Signals.aura}
        currentCard={frame3CurrentCard}
      />

      {/* Frame progress bar */}
      <FrameProgress currentFrame={4} />

      {/* Main content */}
      <main className="relative z-10 px-4 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={frame3CurrentCard}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            {renderCard()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Card progress dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((card) => (
          <button
            key={card}
            type="button"
            onClick={() => setFrame3Card(card)}
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor: frame3CurrentCard === card
                ? BRAND_COLORS.primary
                : BRAND_COLORS.borderLight,
              transform: frame3CurrentCard === card ? 'scale(1.25)' : 'scale(1)',
            }}
            aria-label={`Go to card ${card}`}
          />
        ))}
      </div>
    </div>
  );
}

export default Frame4Operating;
