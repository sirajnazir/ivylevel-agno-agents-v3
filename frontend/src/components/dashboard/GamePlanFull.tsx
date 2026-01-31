/**
 * GamePlanFull Dashboard Component
 * Complete action list with filtering by phase and priority.
 * @version 10.0
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Clock, Zap, CheckCircle2, Circle } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { GamePlanAction } from '@/lib/hooks/useAgentAPI';

interface GamePlanFullProps {
  actions?: GamePlanAction[];
  loading?: boolean;
}

const MOCK_ACTIONS: GamePlanAction[] = [
  { id: '1', title: 'Research 5 summer programs in your interest area', description: 'Focus on STEM programs with deadline by December', category: 'OPPORTUNITIES', priority: 'critical', phase: 'immediate', impact_score: 95, time_estimate: '2 hours' },
  { id: '2', title: 'Start a reflection journal for essay brainstorming', description: 'Write 10 minutes daily about meaningful experiences', category: 'NARRATIVE', priority: 'high', phase: 'immediate', impact_score: 88, time_estimate: '15 min/day' },
  { id: '3', title: 'Schedule meeting with school counselor', description: 'Discuss course selection for senior year', category: 'ACADEMICS', priority: 'high', phase: 'immediate', impact_score: 82, time_estimate: '30 min' },
  { id: '4', title: 'Identify leadership opportunity in current activity', description: 'Look for committee positions or project leadership', category: 'ACTIVITIES', priority: 'medium', phase: 'short_term', impact_score: 75, time_estimate: '1 hour' },
  { id: '5', title: 'Build preliminary college list (15-20 schools)', description: 'Include reaches, matches, and safeties', category: 'STRATEGY', priority: 'high', phase: 'short_term', impact_score: 90, time_estimate: '3 hours' },
  { id: '6', title: 'Take practice SAT/ACT to determine focus', description: 'Use official practice tests', category: 'ACADEMICS', priority: 'medium', phase: 'short_term', impact_score: 70, time_estimate: '4 hours' },
  { id: '7', title: 'Research scholarship opportunities', description: 'Create spreadsheet of deadlines and requirements', category: 'OPPORTUNITIES', priority: 'medium', phase: 'long_term', impact_score: 85, time_estimate: '2 hours' },
  { id: '8', title: 'Develop spike activity or project', description: 'Create something demonstrating deep expertise', category: 'ACTIVITIES', priority: 'high', phase: 'long_term', impact_score: 92, time_estimate: 'Ongoing' },
];

const PHASE_CONFIG = {
  immediate: { label: 'Immediate (0-2 weeks)', color: BRAND_COLORS.error },
  short_term: { label: 'Short-term (1-3 months)', color: BRAND_COLORS.warning },
  long_term: { label: 'Long-term (3+ months)', color: BRAND_COLORS.info },
};

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-100', text: 'text-red-700' },
  high: { label: 'High', bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { label: 'Medium', bg: 'bg-blue-100', text: 'text-blue-700' },
  low: { label: 'Low', bg: 'bg-gray-100', text: 'text-gray-600' },
};

export function GamePlanFull({ actions = MOCK_ACTIONS, loading }: GamePlanFullProps) {
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredActions = actions.filter(action => {
    if (phaseFilter !== 'all' && action.phase !== phaseFilter) return false;
    if (priorityFilter !== 'all' && action.priority !== priorityFilter) return false;
    return true;
  });

  const toggleComplete = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white"
        >
          <option value="all">All Phases</option>
          <option value="immediate">Immediate</option>
          <option value="short_term">Short-term</option>
          <option value="long_term">Long-term</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <span className="ml-auto text-sm text-gray-500">
          {filteredActions.length} actions • {completedIds.size} completed
        </span>
      </div>

      {/* Action List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredActions.map((action) => {
          const isCompleted = completedIds.has(action.id);
          const isExpanded = expandedId === action.id;
          const priorityStyle = PRIORITY_CONFIG[action.priority];

          return (
            <div
              key={action.id}
              className={`rounded-xl border transition-all ${
                isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3 p-3">
                {/* Checkbox */}
                <button
                  onClick={() => toggleComplete(action.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {isCompleted ? (
                    <CheckCircle2 size={20} className="text-green-500" />
                  ) : (
                    <Circle size={20} className="text-gray-300 hover:text-gray-400" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {action.title}
                    </p>
                    <span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full ${priorityStyle.bg} ${priorityStyle.text}`}>
                      {priorityStyle.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {action.time_estimate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap size={12} />
                      {action.impact_score} impact
                    </span>
                    <span>{PHASE_CONFIG[action.phase].label.split(' ')[0]}</span>
                  </div>

                  {/* Expandable details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-gray-100"
                    >
                      <p className="text-sm text-gray-600">{action.description}</p>
                      {action.tips && action.tips.length > 0 && (
                        <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
                          {action.tips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : action.id)}
                  className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-xl" />
      ))}
    </div>
  );
}

export default GamePlanFull;
