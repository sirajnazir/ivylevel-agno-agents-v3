/**
 * IvyQuest v3.0 — Frame 4: Reveal
 *
 * Main orchestrator component for Frame 4 (Reveal).
 * THE PAYOFF — Show the student their comprehensive assessment results
 *
 * Frame 4 displays:
 * - Card 1: Launch sequence animation (dramatic reveal)
 * - Card 2: Dual score display (Profile Strength + Market Reality)
 * - Card 3: School-specific fit cards (swipeable)
 * - Card 4: Category breakdown (Aptitude, Passion, Community, Operating)
 *
 * Outputs: IvyReadyScore, SchoolFits, CategoryBreakdowns for Frame 5
 *
 * @version 2.0.0
 */

'use client';

import React, { useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useFrame4Store } from '@/lib/store/useFrame4Store';
import { useFrame3Store } from '@/lib/store/useFrame3Store';
import { useStudentStore, useSessionStore, useResultsStore } from '@/lib/store';
import { FrameWrapper, CardNavigation } from '@/components/layout/AssessmentLayout';
import type { AllFrameInputs, Frame4Card, MarketReality } from '@/lib/types/frame4.types';

// Card components
import {
  Card1LaunchSequence,
  Card2DualScore,
  Card3SchoolCards,
  Card4CategoryBreakdown,
} from './reveal';

// ============================================================================
// CARD ORDER & TITLES
// ============================================================================

const CARD_CONFIG: Record<Frame4Card, { title: string; subtitle: string }> = {
  launch: {
    title: 'Preparing Your Results',
    subtitle: 'The moment you\'ve been waiting for...',
  },
  dualScore: {
    title: 'Your Ivy+ Profile',
    subtitle: 'Profile Strength meets Market Reality',
  },
  schoolCards: {
    title: 'School Fit Analysis',
    subtitle: 'See how you match with each target school',
  },
  categoryBreakdown: {
    title: 'Your Strengths & Growth Areas',
    subtitle: 'Breakdown by category',
  },
};

const CARD_ORDER: Frame4Card[] = ['launch', 'dualScore', 'schoolCards', 'categoryBreakdown'];

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

interface Frame4RevealProps {
  onComplete: () => void;
}

export function Frame4Reveal({ onComplete }: Frame4RevealProps) {
  // Frame 4 store
  const {
    currentCard,
    ivyReadyScore,
    schoolFits,
    categoryBreakdowns,
    activeSchoolIndex,
    autoplayEnabled,
    setCurrentCard,
    nextCard,
    prevCard,
    setActiveSchoolIndex,
    toggleAutoplay,
    calculateScores,
    startFrame,
  } = useFrame4Store();

  // Other stores
  const { frame3Signals } = useFrame3Store();
  const profile = useStudentStore((s) => s.profile);
  const { startFrame: startSessionFrame, completeFrame } = useSessionStore();
  const results = useResultsStore();

  // Track transition direction
  const [[direction, prevCardValue], setDirection] = React.useState<[number, Frame4Card]>([
    0,
    currentCard,
  ]);

  // Gather inputs from all frames
  const allInputs: AllFrameInputs = useMemo(() => {
    // Build legacy lookup from legacy_schools array
    const legacyLookup: Record<string, boolean> = {};
    if (profile.demographics.legacy && profile.demographics.legacy_schools) {
      profile.demographics.legacy_schools.forEach((schoolId) => {
        legacyLookup[schoolId] = true;
      });
    }

    // Determine URM status based on ethnicity
    const urmEthnicities = ['AFRICAN_AMERICAN', 'HISPANIC_LATINO', 'NATIVE_AMERICAN'];
    const isUrm = profile.demographics?.ethnicity
      ? urmEthnicities.includes(profile.demographics.ethnicity)
      : false;

    // Frame 0 inputs
    const inputs: AllFrameInputs = {
      targetSchools: profile.target_schools.length > 0
        ? profile.target_schools
        : ['harvard', 'yale', 'princeton'],
      intendedMajor: profile.intended_major || 'Computer Science',
      majorCertainty: profile.major_certainty === 'EXPLORING'
        ? 'exploring'
        : profile.major_certainty === 'LIKELY'
          ? 'likely'
          : 'locked',
      gradeLevel: typeof profile.identity.grade === 'number' ? profile.identity.grade : 12,
      studentName: profile.identity.name || 'Student',

      // Frame 1 inputs
      aptitudeScore: results.ivy_score?.category_scores?.aptitude || 70,
      gpaWeighted: profile.aptitude.gpa_weighted ?? 3.8,
      satTotal: profile.aptitude.sat_total ?? null,
      actComposite: profile.aptitude.act_total ?? null,
      apCount: profile.aptitude.ap_count ?? 5,
      saturationLevel: profile.high_school?.saturation_level ?? 'MEDIUM',
      demographicMultipliers: {
        firstGen: profile.demographics?.first_gen ?? false,
        legacy: legacyLookup,
        urm: isUrm,
        incomePercentile: 50, // Default since income_band is categorical
      },

      // Frame 2 inputs
      passionScore: results.ivy_score?.category_scores?.passion || 65,
      communityScore: results.ivy_score?.category_scores?.community || 60,
      spikeCategory: profile.passion.spike_category || 'ACADEMIC',
      leadershipLevel: profile.passion.leadership_level || 'CLUB',
      serviceHours: profile.community.service_hours || 100,
      studentArchetype: results.archetype_label || 'Ambitious Achiever',

      // Frame 3 inputs
      operatingStyle: frame3Signals.operatingStyle,
      timeCapacity: frame3Signals.timeCapacity,
      energyPattern: frame3Signals.energyPattern,
      strengthProfile: frame3Signals.strengthProfile,
      readinessScore: frame3Signals.readinessScore,
      auraColor: frame3Signals.aura.color,
    };

    return inputs;
  }, [profile, results, frame3Signals]);

  // Initialize frame on mount
  useEffect(() => {
    startFrame();
    startSessionFrame(4, CARD_ORDER.length);

    // Calculate scores with all inputs
    calculateScores(allInputs);

    // Log frame start
    console.log('FRAME4.START', `Schools: ${allInputs.targetSchools.length}`);
  }, [startFrame, startSessionFrame, calculateScores, allInputs]);

  // Track direction for animations
  useEffect(() => {
    if (currentCard !== prevCardValue) {
      const currentIndex = CARD_ORDER.indexOf(currentCard);
      const prevIndex = CARD_ORDER.indexOf(prevCardValue);
      setDirection([currentIndex > prevIndex ? 1 : -1, currentCard]);
    }
  }, [currentCard, prevCardValue]);

  // Card completion handlers
  const handleLaunchComplete = useCallback(() => {
    nextCard();
  }, [nextCard]);

  const handleDualScoreComplete = useCallback(() => {
    nextCard();
  }, [nextCard]);

  const handleSchoolCardsComplete = useCallback(() => {
    nextCard();
  }, [nextCard]);

  const handleCategoryComplete = useCallback(() => {
    // Complete the frame
    completeFrame();

    // Log completion
    console.log('FRAME4.COMPLETE', `IvyScore: ${ivyReadyScore?.total}, Duration: ${Date.now()}`);

    // Navigate to next frame
    onComplete();
  }, [completeFrame, ivyReadyScore, onComplete]);

  const handleBack = useCallback(() => {
    if (currentCard !== 'launch') {
      prevCard();
    }
  }, [currentCard, prevCard]);

  // Calculate market reality for Card 2
  const marketReality: MarketReality = useMemo(() => {
    if (!schoolFits.length) {
      return { min: 5, max: 15, label: 'reach', confidence: 0.7 };
    }

    // Average across all schools
    const avgMin = Math.round(
      schoolFits.reduce((sum, s) => sum + s.probability.min, 0) / schoolFits.length
    );
    const avgMax = Math.round(
      schoolFits.reduce((sum, s) => sum + s.probability.max, 0) / schoolFits.length
    );

    // Determine label based on average
    const avg = (avgMin + avgMax) / 2;
    const label: MarketReality['label'] =
      avg >= 40 ? 'safety' : avg >= 20 ? 'target' : 'reach';

    return { min: avgMin, max: avgMax, label, confidence: 0.8 };
  }, [schoolFits]);

  // Current card config
  const currentCardConfig = CARD_CONFIG[currentCard];
  const currentIndex = CARD_ORDER.indexOf(currentCard);
  const canGoBack = currentIndex > 0 && currentCard !== 'launch';
  const isLastCard = currentCard === 'categoryBreakdown';

  // Render current card
  const renderCard = () => {
    switch (currentCard) {
      case 'launch':
        return <Card1LaunchSequence onComplete={handleLaunchComplete} />;

      case 'dualScore':
        if (!ivyReadyScore) return null;
        return (
          <Card2DualScore
            ivyReadyScore={ivyReadyScore}
            marketReality={marketReality}
            schoolCount={schoolFits.length}
            onComplete={handleDualScoreComplete}
          />
        );

      case 'schoolCards':
        return (
          <Card3SchoolCards
            schoolFits={schoolFits}
            activeIndex={activeSchoolIndex}
            onIndexChange={setActiveSchoolIndex}
            autoplay={autoplayEnabled}
            onToggleAutoplay={toggleAutoplay}
            onComplete={handleSchoolCardsComplete}
          />
        );

      case 'categoryBreakdown':
        return (
          <Card4CategoryBreakdown
            categoryBreakdowns={categoryBreakdowns}
            onComplete={handleCategoryComplete}
          />
        );

      default:
        return null;
    }
  };

  return (
    <FrameWrapper
      title={currentCardConfig.title}
      subtitle={currentCardConfig.subtitle}
    >
      {/* Main content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentCard}
          custom={direction}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="w-full"
        >
          {renderCard()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation (hidden during launch sequence) */}
      {currentCard !== 'launch' && (
        <CardNavigation
          currentCard={currentIndex}
          totalCards={CARD_ORDER.length}
          onNext={isLastCard ? handleCategoryComplete : nextCard}
          onPrev={handleBack}
          canProgress={true}
          nextLabel={isLastCard ? 'See Power-Ups' : 'Continue'}
          showPrev={canGoBack}
        />
      )}

      {/* Card progress dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {CARD_ORDER.map((card, idx) => (
          <button
            key={card}
            type="button"
            onClick={() => {
              // Only allow navigation to already-visited cards
              if (idx <= currentIndex) {
                setCurrentCard(card);
              }
            }}
            disabled={idx > currentIndex}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-300',
              currentCard === card
                ? 'bg-primary-blue scale-125'
                : idx < currentIndex
                ? 'bg-primary-blue/50 hover:bg-primary-blue/70'
                : 'bg-border-subtle'
            )}
            aria-label={`Go to ${CARD_CONFIG[card].title}`}
          />
        ))}
      </div>
    </FrameWrapper>
  );
}

export default Frame4Reveal;
