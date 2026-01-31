/**
 * IvyQuest v3.0 — Frame 4: Card 1 - Scenarios
 *
 * STYLING: Uses BRAND_COLORS constants for consistent Ivylevel branding.
 *
 * @version 2.0.0
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { SCENARIOS, SCENARIO_IDS, IVY_MESSAGES } from '@/lib/constants/frame3.constants';
import { BRAND_COLORS } from '@/lib/constants/brand';
import {
  IconAI,
  IconChecklist,
  IconEnergy,
  IconUsers,
  IconMicroscope,
  IconTarget,
  IconRocket,
} from '@/components/icons';
import type { Card1Props, ScenarioResponses } from '@/lib/types/frame3.types';
import type { ScenarioId } from '@/lib/constants/frame3.constants';

// Icon mapping for Scenario Options - maps option ID to icon component
const SCENARIO_OPTION_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  systematic: IconChecklist,
  adaptive: IconEnergy,
  social: IconUsers,
  solo: IconMicroscope,
  cautious: IconTarget,
  bold: IconRocket,
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ScenarioOptionProps {
  optionId: string;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const ScenarioOption: React.FC<ScenarioOptionProps> = ({
  optionId,
  label,
  description,
  isSelected,
  onClick,
}) => {
  const IconComponent = SCENARIO_OPTION_ICONS[optionId];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 min-h-[140px]"
      style={
        isSelected
          ? {
              borderColor: BRAND_COLORS.primary,
              backgroundColor: BRAND_COLORS.primaryBg,
              boxShadow: BRAND_COLORS.shadowPrimary,
            }
          : {
              borderColor: BRAND_COLORS.borderLight,
              backgroundColor: BRAND_COLORS.bgPrimary,
            }
      }
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute top-3 right-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: BRAND_COLORS.primary }}
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </motion.div>
      )}

      <div className="mb-2">
        {IconComponent && (
          <IconComponent
            size={36}
            color={isSelected ? BRAND_COLORS.primary : BRAND_COLORS.iconPrimary}
          />
        )}
      </div>
      <span
        className="font-semibold text-lg mb-1"
        style={{ color: isSelected ? BRAND_COLORS.primary : BRAND_COLORS.textHeading }}
      >
        {label}
      </span>
      <span
        className="text-sm text-center leading-snug"
        style={{ color: BRAND_COLORS.textSecondary }}
      >
        {description}
      </span>
    </motion.button>
  );
};

interface ScenarioCardProps {
  scenarioId: ScenarioId;
  scenarioIndex: number;
  currentResponse: string | null;
  onSelect: (response: string) => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenarioId,
  scenarioIndex,
  currentResponse,
  onSelect,
}) => {
  const scenario = SCENARIOS[scenarioId];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div
        className="rounded-2xl p-6 border"
        style={{
          backgroundColor: BRAND_COLORS.bgPrimary,
          borderColor: BRAND_COLORS.borderLight,
        }}
      >
        {/* Scenario header */}
        <div className="mb-6">
          <span
            className="text-sm uppercase tracking-wider"
            style={{ color: BRAND_COLORS.textMuted }}
          >
            Scenario {scenarioIndex + 1} of 3: {scenario.title}
          </span>
        </div>

        {/* Prompt */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: BRAND_COLORS.bgHover }}
        >
          <p
            className="text-lg leading-relaxed"
            style={{ color: BRAND_COLORS.textPrimary }}
          >
            {scenario.prompt}
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScenarioOption
            optionId={scenario.optionA.id}
            label={scenario.optionA.label}
            description={scenario.optionA.description}
            isSelected={currentResponse === scenario.optionA.id}
            onClick={() => onSelect(scenario.optionA.id)}
          />
          <ScenarioOption
            optionId={scenario.optionB.id}
            label={scenario.optionB.label}
            description={scenario.optionB.description}
            isSelected={currentResponse === scenario.optionB.id}
            onClick={() => onSelect(scenario.optionB.id)}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Card1Scenarios: React.FC<Card1Props> = ({
  scenarioResponses,
  onScenarioSelect,
  onContinue,
  onBack,
  validation,
}) => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);

  const currentScenarioId = SCENARIO_IDS[currentScenarioIndex];
  const currentResponse = scenarioResponses[currentScenarioId];

  const handleSelect = useCallback(
    (response: string) => {
      onScenarioSelect(currentScenarioId, response);

      // Auto-advance to next scenario after short delay
      if (currentScenarioIndex < 2) {
        setTimeout(() => {
          setCurrentScenarioIndex(currentScenarioIndex + 1);
        }, 400);
      }
    },
    [currentScenarioId, currentScenarioIndex, onScenarioSelect]
  );

  const handlePrevScenario = useCallback(() => {
    if (currentScenarioIndex > 0) {
      setCurrentScenarioIndex(currentScenarioIndex - 1);
    } else {
      onBack();
    }
  }, [currentScenarioIndex, onBack]);

  const handleNextScenario = useCallback(() => {
    if (currentScenarioIndex < 2) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
    } else if (validation.isValid) {
      onContinue();
    }
  }, [currentScenarioIndex, validation.isValid, onContinue]);

  const canContinue = currentScenarioIndex === 2 && validation.isValid;
  const canGoNext = currentScenarioIndex < 2 || canContinue;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-display font-bold mb-3"
          style={{ color: BRAND_COLORS.textHeading }}
        >
          Calibrate Your System
        </h2>
        <div
          className="flex items-center justify-center gap-2"
          style={{ color: BRAND_COLORS.textSecondary }}
        >
          <IconAI size={20} color={BRAND_COLORS.iconPrimary} />
          <span>Ivy: &quot;{IVY_MESSAGES.card1.intro}&quot;</span>
        </div>
      </div>

      {/* Scenario content */}
      <AnimatePresence mode="wait">
        <ScenarioCard
          key={currentScenarioId}
          scenarioId={currentScenarioId}
          scenarioIndex={currentScenarioIndex}
          currentResponse={currentResponse}
          onSelect={handleSelect}
        />
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-6 mb-6">
        {SCENARIO_IDS.map((id, index) => {
          const isAnswered = scenarioResponses[id] !== null;
          const isCurrent = index === currentScenarioIndex;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setCurrentScenarioIndex(index)}
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{
                backgroundColor: isCurrent
                  ? BRAND_COLORS.primary
                  : isAnswered
                    ? `${BRAND_COLORS.primary}80`
                    : BRAND_COLORS.borderLight,
                transform: isCurrent ? 'scale(1.25)' : 'scale(1)',
              }}
              aria-label={`Go to scenario ${index + 1}`}
            />
          );
        })}
      </div>

      {/* Validation message */}
      {!validation.isValid && currentScenarioIndex === 2 && (
        <p
          className="text-center text-sm mb-4"
          style={{ color: BRAND_COLORS.warning }}
        >
          Please answer at least {validation.minRequired} scenarios to continue
        </p>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handlePrevScenario}
          className="px-6 py-3 rounded-xl font-medium transition-all"
          style={{
            color: BRAND_COLORS.textSecondary,
            backgroundColor: 'transparent',
          }}
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleNextScenario}
          disabled={!canGoNext}
          className="px-6 py-3 rounded-xl font-medium transition-all"
          style={
            canGoNext
              ? {
                  backgroundColor: BRAND_COLORS.primary,
                  color: 'white',
                  boxShadow: BRAND_COLORS.shadowPrimary,
                }
              : {
                  backgroundColor: BRAND_COLORS.borderLight,
                  color: BRAND_COLORS.textMuted,
                  cursor: 'not-allowed',
                }
          }
        >
          {currentScenarioIndex === 2 ? 'Continue →' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

export default Card1Scenarios;
