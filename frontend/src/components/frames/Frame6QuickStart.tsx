/**
 * Frame6QuickStart Component
 * Simplified game plan showing only TOP 3 highest-impact actions.
 * Full game plan moved to Command Deck.
 * @version 10.0
 */

'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, Clock, TrendingUp, Calendar, 
  ArrowRight, ExternalLink, CheckCircle2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSessionStore, useViewMode } from '@/lib/store/useSessionStore';
import { getFeatureFlags, getPostAssessmentRoute } from '@/lib/config/featureFlags';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { GamePlanAction } from '@/lib/hooks/useAgentAPI';

interface Frame6QuickStartProps {
  onComplete: () => void;
  actions: GamePlanAction[];
  calendlyUrl?: string;
}

const PRIORITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  high: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  low: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
};

// Fallback actions when agents unavailable
const FALLBACK_ACTIONS: GamePlanAction[] = [
  {
    id: 'fb-1',
    title: 'Start Your Common App Account',
    description: 'Create your account and begin filling in basic information.',
    category: 'application',
    priority: 'critical',
    phase: 'immediate',
    impact_score: 95,
    time_estimate: '30 min',
  },
  {
    id: 'fb-2',
    title: 'Draft Your Activities List',
    description: 'List all activities with descriptions, hours, and leadership roles.',
    category: 'activities',
    priority: 'high',
    phase: 'immediate',
    impact_score: 88,
    time_estimate: '1 hour',
  },
  {
    id: 'fb-3',
    title: 'Identify 3 Essay Topics',
    description: 'Brainstorm potential personal essay topics based on your experiences.',
    category: 'essays',
    priority: 'high',
    phase: 'immediate',
    impact_score: 85,
    time_estimate: '45 min',
  },
];

export function Frame6QuickStart({ 
  onComplete, 
  actions,
  calendlyUrl = 'https://calendly.com/ivylevel/strategy' 
}: Frame6QuickStartProps) {
  const router = useRouter();
  const flags = getFeatureFlags();
  const viewMode = useViewMode();
  const { setAssessmentComplete } = useSessionStore();
  const [startedAction, setStartedAction] = useState<string | null>(null);

  // Get TOP 3 actions
  const top3Actions = useMemo(() => {
    const sourceActions = actions.length > 0 ? actions : FALLBACK_ACTIONS;
    
    // Filter to critical and high priority
    const highPriority = sourceActions.filter(
      a => a.priority === 'critical' || a.priority === 'high'
    );
    
    // Sort by impact score
    const sorted = highPriority.sort((a, b) => b.impact_score - a.impact_score);
    
    // Take top 3
    return sorted.slice(0, 3);
  }, [actions]);

  const handleStartAction = (actionId: string) => {
    setStartedAction(actionId);
    setAssessmentComplete(true);
    
    // Navigate to Command Deck with action highlighted
    const route = getPostAssessmentRoute();
    router.push(`${route}?startAction=${actionId}`);
  };

  const handleBookCall = () => {
    window.open(calendlyUrl, '_blank');
  };

  const handleViewFullPlan = () => {
    setAssessmentComplete(true);
    router.push(getPostAssessmentRoute());
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: BRAND_COLORS.accentBg }}
          >
            <Rocket size={32} style={{ color: BRAND_COLORS.accent }} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-2"
            style={{ color: BRAND_COLORS.primary }}
          >
            Your Quick Start
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: BRAND_COLORS.textSecondary }}
          >
            {viewMode === 'parent' 
              ? 'Top 3 actions for your child this week'
              : 'Focus on these 3 actions this week for maximum impact'}
          </motion.p>
        </div>

        {/* Action Cards */}
        <div className="space-y-4 mb-8">
          {top3Actions.map((action, idx) => (
            <QuickActionCard
              key={action.id}
              action={action}
              number={idx + 1}
              isStarted={startedAction === action.id}
              onStart={() => handleStartAction(action.id)}
            />
          ))}
        </div>

        {/* Binary CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => handleStartAction(top3Actions[0]?.id)}
            className="py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: BRAND_COLORS.primary, color: 'white' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Rocket size={20} />
            Start Action #1 Now
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleBookCall}
            className="py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 border-2"
            style={{ 
              borderColor: BRAND_COLORS.primary, 
              color: BRAND_COLORS.primary,
              backgroundColor: 'white'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar size={20} />
            Book 15-min Strategy Call
            <ExternalLink size={14} />
          </motion.button>
        </div>

        {/* Full Plan Link */}
        {flags.commandDeck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={handleViewFullPlan}
              className="text-sm flex items-center justify-center gap-1 mx-auto hover:underline"
              style={{ color: BRAND_COLORS.textMuted }}
            >
              View your full game plan in Command Deck
              <ArrowRight size={14} />
            </button>
          </motion.div>
        )}

        {/* Motivation Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-4 rounded-xl text-center"
          style={{ backgroundColor: BRAND_COLORS.successBg }}
        >
          <p className="text-sm" style={{ color: BRAND_COLORS.success }}>
            <strong>Pro tip:</strong> Students who complete ONE action within 24 hours are 3x more likely to follow through on their full game plan.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  action: GamePlanAction;
  number: number;
  isStarted: boolean;
  onStart: () => void;
}

function QuickActionCard({ action, number, isStarted, onStart }: QuickActionCardProps) {
  const colors = PRIORITY_COLORS[action.priority];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: number * 0.15 }}
      className={`rounded-2xl p-5 border ${isStarted ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'} shadow-sm`}
    >
      <div className="flex items-start gap-4">
        {/* Number Badge */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg"
          style={{ 
            backgroundColor: isStarted ? BRAND_COLORS.success : BRAND_COLORS.primary,
            color: 'white'
          }}
        >
          {isStarted ? <CheckCircle2 size={20} /> : number}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{action.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
              {action.priority}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{action.description}</p>
          
          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {action.time_estimate}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp size={12} />
              {action.impact_score}% impact
            </span>
          </div>
        </div>

        {/* Start Button */}
        {!isStarted && (
          <button
            onClick={onStart}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ 
              backgroundColor: BRAND_COLORS.primaryBg,
              color: BRAND_COLORS.primary
            }}
          >
            Start
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default Frame6QuickStart;
