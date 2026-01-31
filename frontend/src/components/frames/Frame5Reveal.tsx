'use client';

/**
 * Frame 5: Reveal
 *
 * STYLING: Uses BRAND_COLORS constants for consistent Ivylevel branding.
 * Never use dark-mode Tailwind classes (text-text-primary, bg-background-secondary, etc.)
 */

import { useState, useCallback, useEffect, useRef, lazy, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useResultsStore, useSessionStore, useStudentStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ScoreRing, ScoreBadge } from '@/components/ui/ScoreRing';
import { CircularProgress } from '@/components/rings/CircularProgress';
import { PillarCards } from '@/components/rings/PillarCards';
import { Progress } from '@/components/ui/Progress';
import { FrameWrapper, CardNavigation } from '@/components/layout/AssessmentLayout';
import { SCHOOL_DATABASE } from '@/lib/data/schools';
import { BRAND_COLORS } from '@/lib/constants/brand';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Star,
  Zap,
  GraduationCap,
  ArrowRight,
  Users,
  Loader2,
} from 'lucide-react';
import type { SchoolProbability, SchoolFit, IvyReadyScore } from '@/lib/types/student';
import { LoadingInsight } from '@/components/insights/LoadingInsight';
import { generateLoadingInsights } from '@/lib/insights/loadingInsights';

// Lazy load 3D components to avoid SSR issues
const TwinFleet = lazy(() => import('@/components/twin/TwinFleet').then(mod => ({ default: mod.TwinFleet })));

const REVEAL_STAGES = ['score', 'schools', 'fleet', 'factors', 'archetype'] as const;
type RevealStage = (typeof REVEAL_STAGES)[number];

interface Frame5Props {
  onComplete: () => void;
}

export function Frame5Reveal({ onComplete }: Frame5Props) {
  const [currentStage, setCurrentStage] = useState(0);
  const [isScoring, setIsScoring] = useState(false);
  const [scoringError, setScoringError] = useState<string | null>(null);
  const hasStartedScoring = useRef(false);

  const { startFrame, completeCard, completeFrame } = useSessionStore();
  const profile = useStudentStore((s) => s.profile);
  const setResults = useResultsStore((s) => s.setResults);
  const results = useResultsStore((s) => s.results);

  // Derive values directly from results to avoid timing issues with store selectors
  const ivyScore = results?.ivy_ready_score ?? null;
  const schoolProbabilities = results?.school_probabilities ?? [];
  const helpingFactors = results?.helping_factors ?? [];
  const holdingBackFactors = results?.holding_back_factors ?? [];
  const archetype = results?.archetype_label ?? '';
  const tagline = results?.narrative_tagline ?? '';

  // Start frame
  useEffect(() => {
    startFrame(5, REVEAL_STAGES.length);
  }, [startFrame]);

  // Call scoring API when frame loads if no results
  useEffect(() => {
    const runScoring = async () => {
      if (hasStartedScoring.current || results) return;
      hasStartedScoring.current = true;

      setIsScoring(true);
      setScoringError(null);

      try {
        // Ensure profile has target_schools, default to all schools if empty
        const profileToScore = { ...profile };
        if (!profileToScore.target_schools || profileToScore.target_schools.length === 0) {
          profileToScore.target_schools = ['HARVARD', 'STANFORD', 'MIT', 'YALE', 'PRINCETON', 'CALTECH', 'CMU', 'COLUMBIA'];
          console.log('Frame5Reveal: Using default target schools');
        }

        console.log('Frame5Reveal: Sending profile to scoring API:', {
          target_schools: profileToScore.target_schools,
          intended_major: profileToScore.intended_major,
          gpa: profileToScore.aptitude?.gpa_weighted,
        });

        const response = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: profileToScore }),
        });

        const data = await response.json();
        console.log('Frame5Reveal: Scoring API response:', { success: data.success, hasResults: !!data.results, error: data.error });

        if (!response.ok) {
          throw new Error(data.error || data.message || `Scoring failed: ${response.status}`);
        }

        if (data.results) {
          setResults(data.results);
        } else {
          throw new Error('No results in response');
        }
      } catch (error) {
        console.error('Frame5Reveal: Scoring error:', error);
        setScoringError(error instanceof Error ? error.message : 'Failed to calculate scores');
      } finally {
        setIsScoring(false);
      }
    };

    runScoring();
  }, [profile, results, setResults]);

  const handleNext = useCallback(() => {
    completeCard(50);
    if (currentStage < REVEAL_STAGES.length - 1) {
      setCurrentStage((prev) => prev + 1);
    } else {
      // Don't call completeFrame() here - page.tsx handleComplete will do it
      // This prevents double state update that resets currentStage before navigation
      onComplete();
    }
  }, [currentStage, completeCard, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStage > 0) {
      setCurrentStage((prev) => prev - 1);
    }
  }, [currentStage]);

  // Generate personalized loading insights
  const loadingInsights = useMemo(
    () => generateLoadingInsights(profile),
    [profile]
  );

  // Show loading/error state while scoring
  if (!results || !ivyScore) {
    return (
      <FrameWrapper
        title={scoringError ? 'Scoring Error' : 'Calculating Your Results'}
        subtitle={scoringError ? 'Something went wrong' : 'Analyzing your profile with our AI engine...'}
      >
        <div className="w-full max-w-md mx-auto">
          <Card padding="lg">
            <CardContent className="text-center py-8">
              {scoringError ? (
                <div className="space-y-4">
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                    style={{ backgroundColor: BRAND_COLORS.bgError }}
                  >
                    <AlertTriangle className="w-8 h-8" style={{ color: BRAND_COLORS.error }} />
                  </div>
                  <p style={{ color: BRAND_COLORS.error }}>{scoringError}</p>
                  <Button
                    onClick={() => {
                      hasStartedScoring.current = false;
                      setScoringError(null);
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ backgroundColor: BRAND_COLORS.primaryBg }}
                    />
                    <div
                      className="relative w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: BRAND_COLORS.primaryBg }}
                    >
                      <Loader2
                        className="w-10 h-10 animate-spin"
                        style={{ color: BRAND_COLORS.primary }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3
                      className="font-bold text-lg mb-2"
                      style={{ color: BRAND_COLORS.textHeading }}
                    >
                      Building Your Digital Twin Fleet
                    </h3>
                    <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                      Our AI is analyzing 58 attributes across academics, passions, and community impact...
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[
                      'Calculating Ivy+ Ready Score',
                      'Computing school probabilities',
                      'Generating personalized insights',
                    ].map((step, i) => (
                      <div
                        key={step}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: BRAND_COLORS.textMuted }}
                      >
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{
                            backgroundColor: BRAND_COLORS.primary,
                            animationDelay: `${i * 0.3}s`,
                          }}
                        />
                        {step}
                      </div>
                    ))}
                  </div>

                  {/* Rotating personalized insights */}
                  <div
                    className="mt-6 pt-6"
                    style={{ borderTop: `1px solid ${BRAND_COLORS.borderLight}` }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4" style={{ color: BRAND_COLORS.primary }} />
                      <span
                        className="text-xs font-medium uppercase tracking-wide"
                        style={{ color: BRAND_COLORS.textMuted }}
                      >
                        Did You Know?
                      </span>
                    </div>
                    <LoadingInsight messages={loadingInsights} interval={2500} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </FrameWrapper>
    );
  }

  return (
    <FrameWrapper
      title={REVEAL_STAGES[currentStage] === 'score' ? 'Your Ivy+ Score' :
             REVEAL_STAGES[currentStage] === 'schools' ? 'School Probabilities' :
             REVEAL_STAGES[currentStage] === 'fleet' ? 'Your Digital Twin Fleet' :
             REVEAL_STAGES[currentStage] === 'factors' ? 'Your Profile Analysis' :
             'Your Archetype'}
      subtitle={REVEAL_STAGES[currentStage] === 'score' ? 'Based on 58 attributes across 4 layers' :
                REVEAL_STAGES[currentStage] === 'schools' ? 'Real data from CDS 2025 and Chetty 2023' :
                REVEAL_STAGES[currentStage] === 'fleet' ? 'Meet your personalized school avatars' :
                REVEAL_STAGES[currentStage] === 'factors' ? 'What\'s helping and holding you back' :
                'Your unique student profile'}
    >
      <AnimatePresence mode="wait">
        {REVEAL_STAGES[currentStage] === 'score' && (
          <ScoreReveal key="score" ivyScore={ivyScore} />
        )}
        {REVEAL_STAGES[currentStage] === 'schools' && (
          <SchoolsReveal key="schools" probabilities={schoolProbabilities} />
        )}
        {REVEAL_STAGES[currentStage] === 'fleet' && (
          <FleetReveal key="fleet" probabilities={schoolProbabilities} />
        )}
        {REVEAL_STAGES[currentStage] === 'factors' && (
          <FactorsReveal
            key="factors"
            helping={helpingFactors}
            holding={holdingBackFactors}
          />
        )}
        {REVEAL_STAGES[currentStage] === 'archetype' && (
          <ArchetypeReveal key="archetype" archetype={archetype} tagline={tagline} />
        )}
      </AnimatePresence>

      <CardNavigation
        currentCard={currentStage}
        totalCards={REVEAL_STAGES.length}
        onNext={handleNext}
        onPrev={handlePrev}
        canProgress={true}
        nextLabel={currentStage === REVEAL_STAGES.length - 1 ? 'See Power-Ups' : 'Continue'}
      />
    </FrameWrapper>
  );
}

// Score reveal component
function ScoreReveal({ ivyScore }: { ivyScore: IvyReadyScore }) {
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCategories(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Phoenix Rings Visualization - REPLACES ScoreRing */}
      <div className="flex flex-col items-center">
        {/* Container for CircularProgress - let the component handle its own layout */}
        <div className="w-full max-w-[400px]">
          <CircularProgress
            aptitude={ivyScore.category_scores.aptitude}
            passion={ivyScore.category_scores.passion}
            community={ivyScore.category_scores.community}
            narrative={ivyScore.category_scores.narrative}
            totalScore={ivyScore.total_score}
            size={400}
          />
        </div>

        {/* Percentile badge below rings */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Trophy className="w-5 h-5" style={{ color: BRAND_COLORS.warning }} />
          <span
            className="text-lg font-semibold"
            style={{ color: BRAND_COLORS.textHeading }}
          >
            Top {(100 - ivyScore.percentile_rank).toFixed(0)}% of applicants
          </span>
        </div>
      </div>

      {/* Pillar Cards - Phoenix-style animated wave cards */}
      <AnimatePresence>
        {showCategories && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <PillarCards
              aptitude={ivyScore.category_scores.aptitude}
              passion={ivyScore.category_scores.passion}
              community={ivyScore.category_scores.community}
              narrative={ivyScore.category_scores.narrative}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Schools reveal component
function SchoolsReveal({ probabilities }: { probabilities: SchoolProbability[] }) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevealedCount((c) => {
        if (c >= probabilities.length) {
          clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [probabilities.length]);

  const getFitColor = (fit: SchoolFit) => {
    switch (fit) {
      case 'BEST_FIT': return { border: BRAND_COLORS.success, bg: BRAND_COLORS.bgSuccess };
      case 'STRONG_FIT': return { border: BRAND_COLORS.primary, bg: BRAND_COLORS.primaryBg };
      case 'TOUGH': return { border: BRAND_COLORS.warning, bg: BRAND_COLORS.bgWarning };
      case 'WORST_FIT': return { border: BRAND_COLORS.error, bg: BRAND_COLORS.bgError };
    }
  };

  const getFitLabel = (fit: SchoolFit) => {
    switch (fit) {
      case 'BEST_FIT': return 'Best Fit';
      case 'STRONG_FIT': return 'Strong Fit';
      case 'TOUGH': return 'Reach';
      case 'WORST_FIT': return 'Long Shot';
    }
  };

  // Sort by probability
  const sortedProbabilities = [...probabilities].sort((a, b) => b.p_final - a.p_final);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {sortedProbabilities.map((school, idx) => {
        const schoolData = SCHOOL_DATABASE[school.school_id];
        const isRevealed = idx < revealedCount;
        const fitColors = getFitColor(school.fit_level);

        return (
          <motion.div
            key={school.school_id}
            initial={{ opacity: 0, x: -20 }}
            animate={isRevealed ? { opacity: 1, x: 0 } : { opacity: 0.3, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              padding="md"
              style={isRevealed ? {
                borderColor: fitColors.border,
                backgroundColor: fitColors.bg,
              } : {}}
            >
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: schoolData?.twin_color || BRAND_COLORS.primary }}
                    >
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className="font-semibold"
                        style={{ color: BRAND_COLORS.textHeading }}
                      >
                        {school.school_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs"
                          style={{ color: BRAND_COLORS.textMuted }}
                        >
                          Base: {(schoolData?.base_acceptance_rate * 100).toFixed(1)}%
                        </span>
                        <ArrowRight className="w-3 h-3" style={{ color: BRAND_COLORS.textMuted }} />
                        <span
                          className="text-xs font-medium"
                          style={{
                            color: school.p_final > schoolData?.base_acceptance_rate
                              ? BRAND_COLORS.success
                              : BRAND_COLORS.error,
                          }}
                        >
                          You: {(school.p_final * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {isRevealed ? (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-2xl font-bold"
                          style={{ color: BRAND_COLORS.textHeading }}
                        >
                          {(school.p_final * 100).toFixed(0)}%
                        </motion.div>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: fitColors.bg,
                            color: fitColors.border,
                          }}
                        >
                          {getFitLabel(school.fit_level)}
                        </span>
                      </>
                    ) : (
                      <div
                        className="w-16 h-8 rounded animate-pulse"
                        style={{ backgroundColor: BRAND_COLORS.borderLight }}
                      />
                    )}
                  </div>
                </div>

                {/* Fit reasons */}
                {isRevealed && school.fit_reasons.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3"
                    style={{ borderTop: `1px solid ${BRAND_COLORS.borderLight}` }}
                  >
                    <div className="flex flex-wrap gap-2">
                      {school.fit_reasons.slice(0, 2).map((reason, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: BRAND_COLORS.bgPrimary,
                            color: BRAND_COLORS.textSecondary,
                          }}
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// 3D Fleet reveal component
function FleetReveal({ probabilities }: { probabilities: SchoolProbability[] }) {
  const [selectedTwin, setSelectedTwin] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <Card padding="lg">
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
              Your Digital Twin Fleet
            </h3>
          </div>
          <p className="text-sm mb-4" style={{ color: BRAND_COLORS.textSecondary }}>
            Each twin represents you at a different school. Click on any school to see detailed fit information.
          </p>

          {/* 3D Canvas */}
          <div className="h-[400px] rounded-xl overflow-hidden relative">
            <Suspense
              fallback={
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: BRAND_COLORS.bgPrimary }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-8 h-8 border-4 rounded-full animate-spin"
                      style={{
                        borderColor: BRAND_COLORS.primary,
                        borderTopColor: 'transparent',
                      }}
                    />
                    <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                      Loading 3D Fleet...
                    </p>
                  </div>
                </div>
              }
            >
              <TwinFleet
                schoolProbabilities={probabilities}
                selectedTwin={selectedTwin}
                onSelectTwin={setSelectedTwin}
              />
            </Suspense>
          </div>

          {/* Selected twin info */}
          {selectedTwin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl"
              style={{
                backgroundColor: BRAND_COLORS.bgPrimary,
                border: `1px solid ${BRAND_COLORS.borderLight}`,
              }}
            >
              {(() => {
                const school = probabilities.find((s) => s.school_id === selectedTwin);
                const schoolData = SCHOOL_DATABASE[selectedTwin];
                if (!school || !schoolData) return null;

                const getFitTextColor = (fit: SchoolFit) => {
                  switch (fit) {
                    case 'BEST_FIT': return BRAND_COLORS.success;
                    case 'STRONG_FIT': return BRAND_COLORS.primary;
                    case 'TOUGH': return BRAND_COLORS.warning;
                    case 'WORST_FIT': return BRAND_COLORS.error;
                  }
                };

                return (
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: schoolData.twin_color }}
                    >
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4
                        className="font-semibold"
                        style={{ color: BRAND_COLORS.textHeading }}
                      >
                        {school.school_name}
                      </h4>
                      <p className="text-sm mt-1" style={{ color: BRAND_COLORS.textMuted }}>
                        Your probability:{' '}
                        <span className="font-bold" style={{ color: BRAND_COLORS.primary }}>
                          {(school.p_final * 100).toFixed(1)}%
                        </span>
                        {' '}&bull;{' '}
                        Fit:{' '}
                        <span
                          className="font-medium"
                          style={{ color: getFitTextColor(school.fit_level) }}
                        >
                          {school.fit_level.replace('_', ' ')}
                        </span>
                      </p>
                      {school.fit_reasons.length > 0 && (
                        <p className="text-sm mt-2" style={{ color: BRAND_COLORS.success }}>
                          {school.fit_reasons[0]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Factors reveal component
function FactorsReveal({ helping, holding }: { helping: string[]; holding: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid md:grid-cols-2 gap-6"
    >
      {/* Helping factors */}
      <Card
        padding="lg"
        style={{
          borderColor: `${BRAND_COLORS.success}30`,
          backgroundColor: BRAND_COLORS.bgSuccess,
        }}
      >
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" style={{ color: BRAND_COLORS.success }} />
            <h3 className="font-semibold" style={{ color: BRAND_COLORS.success }}>
              Helping You
            </h3>
          </div>
          <ul className="space-y-3">
            {helping.map((factor, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2"
              >
                <CheckCircle
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: BRAND_COLORS.success }}
                />
                <span className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
                  {factor}
                </span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Holding back factors */}
      <Card
        padding="lg"
        style={{
          borderColor: `${BRAND_COLORS.error}30`,
          backgroundColor: BRAND_COLORS.bgError,
        }}
      >
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5" style={{ color: BRAND_COLORS.error }} />
            <h3 className="font-semibold" style={{ color: BRAND_COLORS.error }}>
              Holding Back
            </h3>
          </div>
          <ul className="space-y-3">
            {holding.map((factor, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2"
              >
                <AlertTriangle
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: BRAND_COLORS.error }}
                />
                <span className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
                  {factor}
                </span>
              </motion.li>
            ))}
            {holding.length === 0 && (
              <li
                className="text-sm italic"
                style={{ color: BRAND_COLORS.textMuted }}
              >
                No major concerns detected!
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Archetype reveal component
function ArchetypeReveal({ archetype, tagline }: { archetype: string; tagline: string }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <Card padding="lg">
        <CardContent className="py-8">
          <AnimatePresence>
            {!revealed ? (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse"
                  style={{ backgroundColor: BRAND_COLORS.primaryBg }}
                >
                  <Sparkles className="w-12 h-12" style={{ color: BRAND_COLORS.primary }} />
                </div>
                <p style={{ color: BRAND_COLORS.textSecondary }}>Analyzing your profile...</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <motion.div
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.6, type: 'spring' }}
                  className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary})`,
                    boxShadow: `0 8px 32px ${BRAND_COLORS.primary}40`,
                  }}
                >
                  <Star className="w-16 h-16 text-white" />
                </motion.div>

                <div className="space-y-2">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm uppercase tracking-wider"
                    style={{ color: BRAND_COLORS.textMuted }}
                  >
                    Your Archetype
                  </motion.p>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl md:text-3xl font-display font-bold"
                    style={{ color: BRAND_COLORS.textHeading }}
                  >
                    {archetype || 'Ambitious Achiever'}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-lg italic"
                    style={{ color: BRAND_COLORS.textSecondary }}
                  >
                    "{tagline || 'Building Your Path to Excellence'}"
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: BRAND_COLORS.bgSuccess,
                    color: BRAND_COLORS.success,
                  }}
                >
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">Profile Analysis Complete</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default Frame5Reveal;
