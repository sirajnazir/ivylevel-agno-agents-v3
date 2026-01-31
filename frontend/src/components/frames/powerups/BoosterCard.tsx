/**
 * BoosterCard Component
 * Displays an individual booster recommendation with expand/collapse functionality
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import {
  BOOSTER_CATEGORIES,
  DIFFICULTY_LEVELS,
  TIME_ESTIMATES,
  type BoosterCategoryId,
  type DifficultyId,
} from '@/lib/constants/frame5.constants';
import type { BoosterCardProps } from '@/lib/types/frame5.types';
import {
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCategoryStyles(category: BoosterCategoryId) {
  const categoryConfig = BOOSTER_CATEGORIES[category];
  return {
    color: categoryConfig.color,
    icon: categoryConfig.icon,
    label: categoryConfig.label,
  };
}

function getDifficultyStyles(difficulty: DifficultyId) {
  const config = DIFFICULTY_LEVELS[difficulty];
  return {
    label: config.label,
    icon: config.icon,
    color: config.color,
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BoosterCard({
  booster,
  isExpanded,
  onToggleExpand,
  onToggleSelect,
  onMarkComplete,
}: BoosterCardProps) {
  const categoryStyles = getCategoryStyles(booster.category);
  const difficultyStyles = getDifficultyStyles(booster.difficulty);
  const timeConfig = TIME_ESTIMATES[booster.timeEstimate];

  const impactDisplay = booster.impact > 0 ? `+${booster.impact.toFixed(1)}` : booster.impact.toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card
        padding="none"
        className={cn(
          'transition-all duration-300 overflow-hidden',
          booster.isSelected && 'ring-2 ring-primary-blue shadow-lg',
          booster.isCompleted && 'opacity-60'
        )}
      >
        <CardContent className="p-4">
          {/* Header Row */}
          <div className="flex items-start gap-4">
            {/* Category Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: `${categoryStyles.color}20` }}
            >
              {categoryStyles.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {booster.title}
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    {booster.description}
                  </p>
                </div>

                {/* Selection Button */}
                <button
                  onClick={onToggleSelect}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    booster.isSelected
                      ? 'bg-primary-blue border-primary-blue'
                      : 'border-border-default hover:border-primary-blue'
                  )}
                  aria-label={booster.isSelected ? 'Deselect booster' : 'Select booster'}
                >
                  {booster.isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              </div>

              {/* Meta Row */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {/* Priority Badge */}
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full',
                    booster.confidence === 'high' && 'bg-success-green/20 text-success-green',
                    booster.confidence === 'medium' && 'bg-warning-amber/20 text-warning-amber',
                    booster.confidence === 'low' && 'bg-text-muted/20 text-text-muted'
                  )}
                >
                  {booster.confidence} confidence
                </span>

                {/* Difficulty */}
                <span
                  className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: `${difficultyStyles.color}20`, color: difficultyStyles.color }}
                >
                  {difficultyStyles.icon} {difficultyStyles.label}
                </span>

                {/* Time */}
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Clock className="w-3 h-3" />
                  {timeConfig.label}
                </span>

                {/* Impact */}
                <span className="flex items-center gap-1 text-xs text-success-green font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {impactDisplay} pts
                </span>
              </div>

              {/* Match Reason */}
              <p className="text-xs text-text-muted mt-2 italic">
                {booster.matchReason}
              </p>
            </div>
          </div>

          {/* Expand Toggle */}
          <button
            onClick={onToggleExpand}
            className="w-full mt-4 pt-3 border-t border-border-subtle flex items-center justify-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Hide details</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>View action steps</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-border-subtle space-y-4">
                  {/* Full Description */}
                  <p className="text-sm text-text-secondary">
                    {booster.fullDescription}
                  </p>

                  {/* Action Steps */}
                  <div>
                    <h4 className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary-blue" />
                      Action Steps
                    </h4>
                    <ol className="space-y-2">
                      {booster.actionSteps.map((step, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-text-secondary">
                          <span className="w-5 h-5 rounded-full bg-background-secondary flex items-center justify-center text-xs font-medium text-text-muted flex-shrink-0">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Impact Preview */}
                  <div className="p-3 rounded-lg bg-success-green/10 border border-success-green/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-success-green" />
                        <span className="text-sm font-medium text-success-green">
                          Impact on {booster.targetLayer}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-text-muted text-sm">{booster.currentScore}</span>
                        <span className="mx-2 text-text-muted">→</span>
                        <span className="text-success-green font-semibold">{booster.projectedScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mark Complete (if handler provided) */}
                  {onMarkComplete && (
                    <button
                      onClick={onMarkComplete}
                      className={cn(
                        'w-full py-2 px-4 rounded-lg text-sm font-medium transition-all',
                        booster.isCompleted
                          ? 'bg-success-green/20 text-success-green'
                          : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
                      )}
                    >
                      {booster.isCompleted ? 'Completed!' : 'Mark as Complete'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default BoosterCard;
