/**
 * ActionPlan Component
 * Displays the generated action plan with checklist and progress tracking
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { BOOSTERS_BY_ID, BOOSTER_CATEGORIES } from '@/lib/constants/frame5.constants';
import type { ActionPlanProps, ActionItem } from '@/lib/types/frame5.types';
import {
  Check,
  Circle,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Target,
  Trophy,
  FileText,
} from 'lucide-react';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ActionItemRowProps {
  item: ActionItem;
  onToggle: () => void;
  onUpdateNotes: (notes: string) => void;
}

function ActionItemRow({ item, onToggle, onUpdateNotes }: ActionItemRowProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(item.notes || '');

  const handleSaveNotes = () => {
    onUpdateNotes(notesValue);
    setIsEditingNotes(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-start gap-3 py-3 px-4 rounded-lg transition-all',
        item.isCompleted
          ? 'bg-success-green/10'
          : 'hover:bg-background-secondary'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
          item.isCompleted
            ? 'bg-success-green border-success-green'
            : 'border-border-default hover:border-primary-blue'
        )}
      >
        {item.isCompleted && <Check className="w-3 h-3 text-white" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm transition-all',
            item.isCompleted
              ? 'text-text-muted line-through'
              : 'text-text-primary'
          )}
        >
          {item.step}
        </p>

        {/* Notes */}
        {isEditingNotes ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Add notes..."
              className="w-full px-3 py-2 text-sm bg-background-secondary border border-border-subtle rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 text-xs font-medium bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setNotesValue(item.notes || '');
                  setIsEditingNotes(false);
                }}
                className="px-3 py-1 text-xs font-medium text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {item.notes && (
              <p className="text-xs text-text-muted mt-1 italic">{item.notes}</p>
            )}
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-xs text-primary-blue hover:underline mt-1 flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              {item.notes ? 'Edit note' : 'Add note'}
            </button>
          </>
        )}
      </div>

      {/* Order badge */}
      <span className="text-xs text-text-muted bg-background-secondary px-2 py-0.5 rounded-full flex-shrink-0">
        Step {item.order}
      </span>
    </motion.div>
  );
}

// ============================================================================
// BOOSTER GROUP
// ============================================================================

interface BoosterGroupProps {
  boosterId: string;
  items: ActionItem[];
  onToggleStep: (itemId: string) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  defaultExpanded?: boolean;
}

function BoosterGroup({
  boosterId,
  items,
  onToggleStep,
  onUpdateNotes,
  defaultExpanded = true,
}: BoosterGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const booster = BOOSTERS_BY_ID[boosterId];

  if (!booster) return null;

  const completedCount = items.filter(item => item.isCompleted).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const categoryConfig = BOOSTER_CATEGORIES[booster.category];

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-background-secondary transition-colors"
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: `${categoryConfig.color}20` }}
        >
          {booster.icon}
        </div>

        {/* Title */}
        <div className="flex-1 text-left">
          <h4 className="font-medium text-text-primary">{booster.title}</h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-text-muted">
              {completedCount}/{totalCount} steps
            </span>
            <div className="flex-1 max-w-24">
              <Progress value={progressPercent} size="sm" />
            </div>
          </div>
        </div>

        {/* Expand Icon */}
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-muted" />
        )}
      </button>

      {/* Items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border-subtle overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {items.map(item => (
                <ActionItemRow
                  key={item.id}
                  item={item}
                  onToggle={() => onToggleStep(item.id)}
                  onUpdateNotes={(notes) => onUpdateNotes(item.id, notes)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ActionPlan({ plan, onToggleStep, onUpdateNotes }: ActionPlanProps) {
  // Group items by booster
  const groupedItems = plan.items.reduce((acc, item) => {
    if (!acc[item.boosterId]) {
      acc[item.boosterId] = [];
    }
    acc[item.boosterId].push(item);
    return acc;
  }, {} as Record<string, ActionItem[]>);

  const progressPercent = plan.totalSteps > 0
    ? (plan.completedSteps / plan.totalSteps) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card padding="lg" className="bg-gradient-to-br from-primary-blue/10 to-primary-blue/5 border-primary-blue/30">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-blue/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Your Action Plan</h3>
                <p className="text-sm text-text-muted">
                  {plan.completedSteps} of {plan.totalSteps} steps complete
                </p>
              </div>
            </div>

            {/* Completion Badge */}
            {progressPercent === 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-success-green/20 rounded-full"
              >
                <Trophy className="w-4 h-4 text-success-green" />
                <span className="text-sm font-medium text-success-green">Complete!</span>
              </motion.div>
            )}
          </div>

          {/* Progress Bar */}
          <Progress value={progressPercent} size="lg" showValue />

          {/* Meta Info */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Clock className="w-4 h-4" />
              <span>Est. {plan.estimatedWeeks} weeks</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Calendar className="w-4 h-4" />
              <span>{Object.keys(groupedItems).length} boosters</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-success-green">
              <Target className="w-4 h-4" />
              <span>Projected: {plan.projectedIvyReadyScore}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booster Groups */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([boosterId, items], index) => (
          <motion.div
            key={boosterId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <BoosterGroup
              boosterId={boosterId}
              items={items}
              onToggleStep={onToggleStep}
              onUpdateNotes={onUpdateNotes}
              defaultExpanded={index === 0}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ActionPlan;
