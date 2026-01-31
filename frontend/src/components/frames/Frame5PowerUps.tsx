/**
 * IvyQuest v3.0 — Frame 5: Power-Ups
 *
 * Main orchestrator component for Frame 5 (Power-Ups).
 * The action-oriented finale — personalized booster recommendations.
 *
 * Frame 5 displays:
 * - Card 1: Overview — Current profile summary and top opportunities
 * - Card 2: Booster Selection — Browse and select power-ups
 * - Card 3: Impact Preview — See cumulative effect of selections
 * - Card 4: Action Plan — Get specific next steps
 *
 * @version 1.0.0
 */

'use client';

import React, { useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import {
  useFrame5Store,
  useFrame5Card,
  useFilteredBoosters,
  useSelectedBoosterObjects,
  useTopRecommendations,
  useFrame5ProjectedScores,
  useFrame5ActionPlan,
  useFrame5Inputs,
} from '@/lib/store/useFrame5Store';
import { useFrame4Store } from '@/lib/store/useFrame4Store';
import { useSessionStore, useStudentStore } from '@/lib/store';
import { FrameWrapper, CardNavigation } from '@/components/layout/AssessmentLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BoosterCard, ImpactSummary, ActionPlan } from './powerups';
import {
  BOOSTER_CATEGORIES,
  FRAME5_IVY_MESSAGES,
  type BoosterCategoryId,
} from '@/lib/constants/frame5.constants';
import type { Frame5Inputs } from '@/lib/types/frame5.types';
import {
  Sparkles,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Target,
  TrendingUp,
  Zap,
  CheckCircle,
} from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const CARD_TITLES = [
  { title: 'Your Profile Overview', subtitle: 'Current strength and opportunities' },
  { title: 'Select Power-Ups', subtitle: 'Choose boosters to strengthen your profile' },
  { title: 'Impact Preview', subtitle: 'See your projected improvements' },
  { title: 'Your Action Plan', subtitle: 'Steps to achieve your goals' },
];

const CARD_COUNT = 4;

// ============================================================================
// CARD COMPONENTS
// ============================================================================

interface Card1OverviewProps {
  inputs: Frame5Inputs;
  onContinue: () => void;
}

function Card1Overview({ inputs, onContinue }: Card1OverviewProps) {
  const topBoosters = useTopRecommendations();
  const ivyMessage = inputs.currentScores.ivyReady >= 75
    ? FRAME5_IVY_MESSAGES.card1.strong
    : inputs.currentScores.ivyReady >= 60
      ? FRAME5_IVY_MESSAGES.card1.average
      : FRAME5_IVY_MESSAGES.card1.developing;

  return (
    <div className="space-y-6">
      {/* Intro Message */}
      <Card padding="lg" className="bg-gradient-to-br from-primary-blue/10 to-transparent border-primary-blue/30">
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-blue/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-blue" />
            </div>
            <div>
              <p className="text-text-primary">{FRAME5_IVY_MESSAGES.card1.intro}</p>
              <p className="text-sm text-text-muted mt-2">{ivyMessage}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Scores */}
      <div className="grid grid-cols-2 gap-4">
        <Card padding="md">
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-blue">
                {inputs.currentScores.ivyReady}
              </div>
              <div className="text-sm text-text-muted mt-1">Ivy+ Ready Score</div>
            </div>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-text-primary">
                {inputs.yearsToApp}
              </div>
              <div className="text-sm text-text-muted mt-1">Years to Application</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layer Breakdown */}
      <Card padding="md">
        <CardContent>
          <h3 className="font-medium text-text-primary mb-3">Your Profile Strength</h3>
          <div className="space-y-3">
            {[
              { key: 'aptitude', label: 'Aptitude', color: '#3B82F6' },
              { key: 'passion', label: 'Passion', color: '#F59E0B' },
              { key: 'community', label: 'Community', color: '#10B981' },
              { key: 'operating', label: 'Operating', color: '#8B5CF6' },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-text-muted w-24">{label}</span>
                <div className="flex-1 h-2 bg-background-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${inputs.currentScores[key as keyof typeof inputs.currentScores]}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-text-primary w-8">
                  {inputs.currentScores[key as keyof typeof inputs.currentScores]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Recommendations */}
      <div>
        <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary-blue" />
          Top Opportunities
        </h3>
        <div className="space-y-3">
          {topBoosters.map((booster, index) => (
            <motion.div
              key={booster.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card padding="sm" className="hover:border-primary-blue/50 transition-colors">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{booster.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary">{booster.title}</h4>
                      <p className="text-xs text-text-muted">{booster.matchReason}</p>
                    </div>
                    <span className="text-success-green font-medium text-sm">
                      +{booster.impact.toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      <Button
        size="lg"
        fullWidth
        onClick={onContinue}
        rightIcon={<ChevronRight className="w-5 h-5" />}
      >
        Browse All Power-Ups
      </Button>
    </div>
  );
}

// ============================================================================

interface Card2SelectionProps {
  onContinue: () => void;
}

function Card2Selection({ onContinue }: Card2SelectionProps) {
  const {
    frame5UI,
    setCategoryFilter,
    setSortBy,
    setExpandedBooster,
    selectBooster,
    deselectBooster,
  } = useFrame5Store();
  const filteredBoosters = useFilteredBoosters();
  const selectedIds = useFrame5Store((s) => s.frame5Data.selectedBoosters);

  const handleToggleSelect = (boosterId: string) => {
    if (selectedIds.includes(boosterId)) {
      deselectBooster(boosterId);
    } else {
      selectBooster(boosterId);
    }
  };

  const canContinue = selectedIds.length > 0;

  return (
    <div className="space-y-6">
      {/* Selection Count */}
      <Card padding="md" className="bg-primary-blue/5 border-primary-blue/30">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-blue/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary-blue" />
              </div>
              <div>
                <p className="font-medium text-text-primary">
                  {selectedIds.length} booster{selectedIds.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-text-muted">{FRAME5_IVY_MESSAGES.card2.intro}</p>
              </div>
            </div>
            <span className="text-sm text-text-muted">Max 10</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
          <button
            onClick={() => setCategoryFilter(null)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              frame5UI.categoryFilter === null
                ? 'bg-primary-blue text-white'
                : 'bg-background-secondary text-text-muted hover:text-text-primary'
            )}
          >
            All
          </button>
          {Object.values(BOOSTER_CATEGORIES).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap',
                frame5UI.categoryFilter === cat.id
                  ? 'text-white'
                  : 'bg-background-secondary text-text-muted hover:text-text-primary'
              )}
              style={{
                backgroundColor: frame5UI.categoryFilter === cat.id ? cat.color : undefined,
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-text-muted" />
        <span className="text-sm text-text-muted">Sort by:</span>
        {(['priority', 'impact', 'time', 'difficulty'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={cn(
              'px-2 py-1 rounded text-xs font-medium transition-colors capitalize',
              frame5UI.sortBy === option
                ? 'bg-primary-blue/20 text-primary-blue'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Booster Grid */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredBoosters.map((booster) => (
            <BoosterCard
              key={booster.id}
              booster={booster}
              isExpanded={frame5UI.expandedBoosterId === booster.id}
              onToggleExpand={() =>
                setExpandedBooster(
                  frame5UI.expandedBoosterId === booster.id ? null : booster.id
                )
              }
              onToggleSelect={() => handleToggleSelect(booster.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Continue Button */}
      <Button
        size="lg"
        fullWidth
        onClick={onContinue}
        disabled={!canContinue}
        rightIcon={<ChevronRight className="w-5 h-5" />}
      >
        {canContinue ? 'See Impact Preview' : 'Select at least 1 booster'}
      </Button>
    </div>
  );
}

// ============================================================================

interface Card3ImpactProps {
  onContinue: () => void;
}

function Card3Impact({ onContinue }: Card3ImpactProps) {
  const inputs = useFrame5Inputs();
  const projectedScores = useFrame5ProjectedScores();
  const selectedBoosters = useSelectedBoosterObjects();

  if (!inputs) return null;

  return (
    <div className="space-y-6">
      {/* Impact Summary */}
      <ImpactSummary
        currentScores={inputs.currentScores}
        projectedScores={projectedScores}
      />

      {/* Selected Boosters */}
      <div>
        <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-warning-amber" />
          Selected Power-Ups ({selectedBoosters.length})
        </h3>
        <div className="space-y-2">
          {selectedBoosters.map((booster) => (
            <Card key={booster.id} padding="sm">
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{booster.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-text-primary text-sm">{booster.title}</h4>
                    <p className="text-xs text-text-muted">
                      {booster.targetLayer} +{booster.impact.toFixed(1)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      booster.confidence === 'high' && 'bg-success-green/20 text-success-green',
                      booster.confidence === 'medium' && 'bg-warning-amber/20 text-warning-amber',
                      booster.confidence === 'low' && 'bg-text-muted/20 text-text-muted'
                    )}
                  >
                    {booster.confidence}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Insight */}
      {projectedScores && (
        <Card padding="md" className="bg-success-green/5 border-success-green/30">
          <CardContent>
            <p className="text-sm text-text-primary">
              <TrendingUp className="w-4 h-4 text-success-green inline mr-2" />
              {FRAME5_IVY_MESSAGES.card3.highImpact}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <Button
        size="lg"
        fullWidth
        onClick={onContinue}
        rightIcon={<ChevronRight className="w-5 h-5" />}
      >
        Get Your Action Plan
      </Button>
    </div>
  );
}

// ============================================================================

interface Card4ActionPlanProps {
  onComplete: () => void;
}

function Card4ActionPlan({ onComplete }: Card4ActionPlanProps) {
  const actionPlan = useFrame5ActionPlan();
  const { toggleActionStep, updateActionNotes } = useFrame5Store();

  if (!actionPlan) return null;

  return (
    <div className="space-y-6">
      {/* Intro */}
      <Card padding="md" className="bg-primary-blue/5 border-primary-blue/30">
        <CardContent>
          <p className="text-sm text-text-primary">
            <Sparkles className="w-4 h-4 text-primary-blue inline mr-2" />
            {FRAME5_IVY_MESSAGES.card4.intro}
          </p>
          <p className="text-xs text-text-muted mt-2">{FRAME5_IVY_MESSAGES.card4.complete}</p>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <ActionPlan
        plan={actionPlan}
        onToggleStep={toggleActionStep}
        onUpdateNotes={updateActionNotes}
      />

      {/* Complete Button */}
      <Button
        size="lg"
        fullWidth
        onClick={onComplete}
        rightIcon={<Zap className="w-5 h-5" />}
      >
        Complete Your Quest
      </Button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface Frame5PowerUpsProps {
  onComplete: () => void;
}

export function Frame5PowerUps({ onComplete }: Frame5PowerUpsProps) {
  const currentCard = useFrame5Card();
  const {
    initializeFrame5,
    nextFrame5Card,
    prevFrame5Card,
    completeFrame5,
    frame5Data,
  } = useFrame5Store();

  // Get data from previous frames
  const { ivyReadyScore, categoryBreakdowns } = useFrame4Store();
  const profile = useStudentStore((s) => s.profile);
  const { startFrame, completeFrame } = useSessionStore();

  // Build inputs from previous frames
  const inputs: Frame5Inputs = useMemo(() => ({
    currentScores: {
      aptitude: ivyReadyScore?.categoryScores?.aptitude ?? 70,
      passion: ivyReadyScore?.categoryScores?.passion ?? 65,
      community: ivyReadyScore?.categoryScores?.community ?? 60,
      operating: ivyReadyScore?.categoryScores?.operating ?? 55,
      ivyReady: ivyReadyScore?.total ?? 65,
    },
    targetSchools: profile.target_schools?.length > 0
      ? profile.target_schools
      : ['harvard', 'yale', 'princeton'],
    yearsToApp: profile.identity?.grade
      ? Math.max(1, 12 - (typeof profile.identity.grade === 'number' ? profile.identity.grade : 12) + 1)
      : 2,
    gradeLevel: String(profile.identity?.grade ?? 11),
    hiddenCapabilities: [],
    operatingStyle: 'balanced',
    hasNationalRecognition: false,
    leadershipRoleCount: 0,
    serviceHours: profile.community?.service_hours ?? 0,
    apCourseCount: profile.aptitude?.ap_count ?? 0,
    hasAwards: false,
  }), [ivyReadyScore, profile]);

  // Initialize on mount
  useEffect(() => {
    startFrame(5, CARD_COUNT);
    initializeFrame5(inputs);
    console.log('[FRAME5.START]', `IvyReady: ${inputs.currentScores.ivyReady}`);
  }, [startFrame, initializeFrame5, inputs]);

  // Handlers
  const handleComplete = useCallback(() => {
    completeFrame5();
    completeFrame();
    console.log('[FRAME5.COMPLETE]', {
      selectedBoosters: frame5Data.selectedBoosters.length,
      actionSteps: frame5Data.actionPlan?.totalSteps ?? 0,
    });
    onComplete();
  }, [completeFrame5, completeFrame, frame5Data, onComplete]);

  const handleBack = useCallback(() => {
    if (currentCard > 0) {
      prevFrame5Card();
    }
  }, [currentCard, prevFrame5Card]);

  // Card config
  const cardConfig = CARD_TITLES[currentCard];
  const isLastCard = currentCard === CARD_COUNT - 1;
  const canGoBack = currentCard > 0;

  // Render current card
  const renderCard = () => {
    switch (currentCard) {
      case 0:
        return frame5Data.inputs ? (
          <Card1Overview inputs={frame5Data.inputs} onContinue={nextFrame5Card} />
        ) : null;
      case 1:
        return <Card2Selection onContinue={nextFrame5Card} />;
      case 2:
        return <Card3Impact onContinue={nextFrame5Card} />;
      case 3:
        return <Card4ActionPlan onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <FrameWrapper title={cardConfig.title} subtitle={cardConfig.subtitle}>
      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {renderCard()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation (shown except on cards with their own buttons) */}
      {currentCard > 0 && (
        <CardNavigation
          currentCard={currentCard}
          totalCards={CARD_COUNT}
          onNext={isLastCard ? handleComplete : nextFrame5Card}
          onPrev={handleBack}
          canProgress={true}
          nextLabel={isLastCard ? 'Complete Quest' : 'Continue'}
          showPrev={canGoBack}
        />
      )}

      {/* Progress Dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {Array.from({ length: CARD_COUNT }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-300',
              currentCard === idx
                ? 'bg-primary-blue scale-125'
                : idx < currentCard
                  ? 'bg-primary-blue/50'
                  : 'bg-border-subtle'
            )}
          />
        ))}
      </div>
    </FrameWrapper>
  );
}

export default Frame5PowerUps;
