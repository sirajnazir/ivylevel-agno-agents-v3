'use client';

/**
 * ActionCard Component
 * Displays action items with category icons, priority badges, and completion status
 * @version 11.0
 */

import { motion } from 'framer-motion';
import { Clock, Zap, CheckCircle2 } from 'lucide-react';
import { getActionCategoryIcon, PRIORITY_CONFIG } from '@/lib/constants/icons';
import { EDGE_TERMS } from '@/lib/constants/edge';

export interface ActionData {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeEstimate?: string;
  edgePoints?: number;
  isCompleted?: boolean;
}

interface ActionCardProps {
  action: ActionData;
  number?: number;
  onStart?: () => void;
  onComplete?: () => void;
}

export function ActionCard({
  action,
  number,
  onStart,
  onComplete
}: ActionCardProps) {
  const categoryConfig = getActionCategoryIcon(action.category);
  const priorityConfig = PRIORITY_CONFIG[action.priority] || PRIORITY_CONFIG.medium;
  const Icon = categoryConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 ${
        action.isCompleted
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Number badge */}
        {number && (
          <div className="w-8 h-8 rounded-full bg-[#641432] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {number}
          </div>
        )}

        {/* Category icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: categoryConfig.bgColor }}
        >
          <Icon size={24} style={{ color: categoryConfig.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold ${
              action.isCompleted
                ? 'text-green-700 line-through'
                : 'text-gray-900'
            }`}>
              {action.title}
            </h3>

            {/* Priority badge */}
            <span
              className="px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0"
              style={{
                backgroundColor: priorityConfig.bgColor,
                color: priorityConfig.color
              }}
            >
              {priorityConfig.label}
            </span>
          </div>

          {action.description && (
            <p className="text-sm text-gray-600 mt-1">{action.description}</p>
          )}

          {/* Metadata row */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            {action.timeEstimate && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {action.timeEstimate}
              </span>
            )}
            {action.edgePoints && (
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <Zap size={14} />
                +{action.edgePoints} {EDGE_TERMS.singular}
              </span>
            )}
          </div>
        </div>

        {/* Action button or completion indicator */}
        {!action.isCompleted && onStart && (
          <button
            onClick={onStart}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[#641432] hover:bg-[#7a1a3d] transition-colors flex-shrink-0"
          >
            Start
          </button>
        )}

        {action.isCompleted && (
          <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
        )}
      </div>
    </motion.div>
  );
}

/**
 * ActionCardList - Renders a list of action cards
 */
export function ActionCardList({
  actions,
  showNumbers = true,
  onActionStart,
  onActionComplete
}: {
  actions: ActionData[];
  showNumbers?: boolean;
  onActionStart?: (action: ActionData) => void;
  onActionComplete?: (action: ActionData) => void;
}) {
  return (
    <div className="space-y-3">
      {actions.map((action, index) => (
        <ActionCard
          key={action.id}
          action={action}
          number={showNumbers ? index + 1 : undefined}
          onStart={onActionStart ? () => onActionStart(action) : undefined}
          onComplete={onActionComplete ? () => onActionComplete(action) : undefined}
        />
      ))}
    </div>
  );
}

export default ActionCard;
