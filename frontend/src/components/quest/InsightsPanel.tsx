'use client';

/**
 * InsightsPanel Component
 * Displays contextual insights with severity styling and actions
 * @version 11.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  X,
  Sparkles,
  Lightbulb,
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  type LucideIcon
} from 'lucide-react';

export type InsightSeverity = 'positive' | 'suggestion' | 'warning' | 'neutral';

export interface Insight {
  id: string;
  type: InsightSeverity;
  category: string;
  message: string;
  detail?: string;
  actionable: boolean;
  action?: {
    label: string;
    handler?: () => void;
  };
}

/**
 * Insight styling configuration
 */
const INSIGHT_STYLES: Record<InsightSeverity, {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  positive: {
    icon: TrendingUp,
    color: '#059669',
    bgColor: '#D1FAE5',
    borderColor: '#A7F3D0'
  },
  suggestion: {
    icon: Lightbulb,
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A'
  },
  warning: {
    icon: AlertTriangle,
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#FECACA'
  },
  neutral: {
    icon: FileText,
    color: '#6B7280',
    bgColor: '#F3F4F6',
    borderColor: '#E5E7EB'
  }
};

interface InsightsPanelProps {
  insights: Insight[];
  position?: 'bottom' | 'side';
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  maxHeight?: number;
}

export function InsightsPanel({
  insights,
  position = 'bottom',
  title = 'Insights',
  collapsible = true,
  defaultExpanded = true,
  maxHeight = 300
}: InsightsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleInsights = insights.filter(i => !dismissedIds.has(i.id));

  if (visibleInsights.length === 0) {
    return null;
  }

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...Array.from(prev), id]));
  };

  const handleAction = (insight: Insight) => {
    if (insight.action?.handler) {
      insight.action.handler();
    }
  };

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ${
        position === 'side' ? 'w-80' : 'w-full'
      }`}
    >
      {/* Header */}
      {collapsible ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#641432]" />
            <span className="font-medium text-gray-900">{title}</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
              {visibleInsights.length}
            </span>
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      ) : (
        <div className="px-4 py-3 bg-gray-50 flex items-center gap-2">
          <Sparkles size={18} className="text-[#641432]" />
          <span className="font-medium text-gray-900">{title}</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
            {visibleInsights.length}
          </span>
        </div>
      )}

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-3 space-y-2 overflow-y-auto"
              style={{ maxHeight: position === 'side' ? maxHeight - 60 : maxHeight - 60 }}
            >
              {visibleInsights.map((insight, idx) => {
                const config = INSIGHT_STYLES[insight.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-xl p-3 relative group"
                    style={{
                      backgroundColor: config.bgColor,
                      borderLeft: `3px solid ${config.color}`
                    }}
                  >
                    {/* Dismiss button */}
                    <button
                      onClick={() => handleDismiss(insight.id)}
                      className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/50 transition-opacity"
                      aria-label="Dismiss insight"
                    >
                      <X size={14} className="text-gray-400" />
                    </button>

                    <div className="flex gap-3">
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <Icon size={18} style={{ color: config.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Category badge */}
                        <span
                          className="text-[10px] font-medium uppercase tracking-wider opacity-80 mb-1 block"
                          style={{ color: config.color }}
                        >
                          {insight.category}
                        </span>

                        {/* Message */}
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {insight.message}
                        </p>

                        {/* Detail */}
                        {insight.detail && (
                          <p className="text-xs text-gray-600 mt-1">
                            {insight.detail}
                          </p>
                        )}

                        {/* Action button */}
                        {insight.actionable && insight.action && (
                          <button
                            onClick={() => handleAction(insight)}
                            className="mt-2 text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                            style={{ color: config.color }}
                          >
                            {insight.action.label}
                            <CheckCircle2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Generate insights based on frame context
 */
export function generateFrameInsights(
  frameId: number,
  profile: any
): Insight[] {
  const insights: Insight[] = [];

  switch (frameId) {
    case 2: // Academic frame
      if (profile?.aptitude?.gpa_weighted >= 4.0) {
        insights.push({
          id: `academic-strength-${Date.now()}`,
          type: 'positive',
          category: 'Academic',
          message: 'Strong GPA foundation detected',
          detail: 'Your GPA puts you in the competitive range for top schools.',
          actionable: false
        });
      }
      if (!profile?.aptitude?.sat_total && !profile?.aptitude?.act_total) {
        insights.push({
          id: `test-missing-${Date.now()}`,
          type: 'suggestion',
          category: 'Testing',
          message: 'Consider adding test scores',
          detail: 'While many schools are test-optional, strong scores can strengthen your application.',
          actionable: true,
          action: { label: 'Add test scores' }
        });
      }
      break;

    case 3: // Activities frame
      if ((profile?.passion?.ec_commitment_years || 0) < 2) {
        insights.push({
          id: `ec-depth-${Date.now()}`,
          type: 'suggestion',
          category: 'Activities',
          message: 'Build deeper activity engagement',
          detail: 'Colleges value sustained commitment over short-term involvement.',
          actionable: true,
          action: { label: 'See recommendations' }
        });
      }
      break;

    case 4: // Context frame
      insights.push({
        id: `context-tip-${Date.now()}`,
        type: 'neutral',
        category: 'Tip',
        message: 'Your responses help us personalize recommendations',
        detail: 'Answer honestly - there are no wrong answers here.',
        actionable: false
      });
      break;

    case 5: // Results frame
      insights.push({
        id: `results-next-${Date.now()}`,
        type: 'positive',
        category: 'Next Steps',
        message: 'Your personalized game plan is ready',
        detail: 'Review your quick wins and long-term actions to maximize your profile.',
        actionable: true,
        action: { label: 'View game plan' }
      });
      break;
  }

  return insights;
}

export default InsightsPanel;
