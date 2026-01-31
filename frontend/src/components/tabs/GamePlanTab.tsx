/**
 * GamePlanTab - Multi-Year Strategic Roadmap
 * v12.0 - Matches original frontend specification
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Target, Calendar, Award,
  Sun, School, Check, Clock, AlertCircle, BookOpen
} from 'lucide-react';
import { ActionCard, type ActionData } from '@/components/ui/ActionCard';
import { COLORS, STATUS_COLORS, GRADIENTS } from '@/lib/constants/design';

interface GamePlanPhase {
  id: string;
  name: string;
  dateRange: string;
  goal: string;
  completionPercent: number;
  milestones: Array<{
    id: string;
    title: string;
    status: 'completed' | 'in_progress' | 'pending';
    targetDate: string;
  }>;
}

interface GamePlanData {
  targetProfile: {
    name: string;
    narrative: string;
  };
  ecStrategy: Array<{
    title: string;
    category: string;
    role: string;
    hoursPerWeek: number;
    impact: string;
    years: string;
  }>;
  targetSchools: Array<{
    name: string;
    tier: 'Reach' | 'Target' | 'Safety';
  }>;
  awards: Array<{ title: string; description: string }>;
  summerPrograms: Array<{ title: string; description: string }>;
  phases: GamePlanPhase[];
  currentPhase?: string;
  actions: ActionData[];
  strategicInsights?: string[];
}

interface GamePlanTabProps {
  data: GamePlanData;
}

export function GamePlanTab({ data }: GamePlanTabProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(data.currentPhase || null);
  const [showBaseline, setShowBaseline] = useState(false);

  const currentPhaseData = data.phases.find(p => p.id === data.currentPhase);

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: COLORS.textHeading }}>
          Your Precision Roadmap
        </h1>
        <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
          Strategic multi-year plan tailored to your goals
        </p>
      </div>

      {/* v10: Strategic Insights / Transparency Notes */}
      {data.strategicInsights && data.strategicInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-xl border-l-4"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderColor: '#3b82f6',
            borderRightWidth: 1,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderRightColor: COLORS.borderDefault,
            borderTopColor: COLORS.borderDefault,
            borderBottomColor: COLORS.borderDefault
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={18} style={{ color: '#3b82f6' }} />
            <h3 className="font-bold text-sm uppercase tracking-wider" style={{ color: '#3b82f6' }}>
              Strategic Insights
            </h3>
          </div>
          <ul className="space-y-2">
            {data.strategicInsights.map((insight, i) => (
              <li key={i} className="text-sm flex gap-2" style={{ color: COLORS.textPrimary }}>
                <span className="text-blue-400 mt-1">•</span>
                <span className="italic">{insight}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Toggle between Baseline and Progress */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowBaseline(false)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!showBaseline ? 'bg-[#667eea] text-white' : 'bg-gray-100 text-gray-600'
            }`}
        >
          Progress & Evolution
        </button>
        <button
          onClick={() => setShowBaseline(true)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${showBaseline ? 'bg-[#667eea] text-white' : 'bg-gray-100 text-gray-600'
            }`}
        >
          Initial Game Plan
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showBaseline ? (
          <motion.div
            key="baseline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Target Profile & Narrative */}
            <BaselineCard title="Target Profile & Narrative" icon={<Target size={18} />}>
              <h4 className="font-semibold" style={{ color: COLORS.textHeading }}>
                {data.targetProfile.name}
              </h4>
              <p className="text-sm mt-2" style={{ color: COLORS.textSecondary }}>
                {data.targetProfile.narrative}
              </p>
            </BaselineCard>

            {/* EC Strategy */}
            <BaselineCard title="Planned EC Strategy" icon={<BookOpen size={18} />}>
              <div className="space-y-3">
                {data.ecStrategy.map((ec, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <h5 className="font-medium">{ec.title}</h5>
                      <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
                        {ec.role} • {ec.hoursPerWeek}h/week • {ec.years}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                      {ec.category}
                    </span>
                  </div>
                ))}
              </div>
            </BaselineCard>

            {/* Target Schools */}
            <BaselineCard title="Target Schools" icon={<School size={18} />}>
              <div className="flex flex-wrap gap-2">
                {data.targetSchools.map((school, i) => {
                  const tierColors = {
                    Reach: { bg: '#fee2e2', text: '#dc2626' },
                    Target: { bg: '#fef3c7', text: '#d97706' },
                    Safety: { bg: '#dcfce7', text: '#16a34a' },
                  };
                  const colors = tierColors[school.tier];
                  return (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {school.name} ({school.tier})
                    </span>
                  );
                })}
              </div>
            </BaselineCard>

            {/* Awards & Summer Programs */}
            <div className="grid md:grid-cols-2 gap-6">
              <BaselineCard title="Target Awards" icon={<Award size={18} />}>
                <ul className="space-y-2">
                  {data.awards.map((award, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{award.title}</span>
                      <span className="text-gray-500 ml-2">— {award.description}</span>
                    </li>
                  ))}
                </ul>
              </BaselineCard>
              <BaselineCard title="Target Summer Programs" icon={<Sun size={18} />}>
                <ul className="space-y-2">
                  {data.summerPrograms.map((prog, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{prog.title}</span>
                      <span className="text-gray-500 ml-2">— {prog.description}</span>
                    </li>
                  ))}
                </ul>
              </BaselineCard>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Current Phase Header */}
            {currentPhaseData && (
              <div
                className="rounded-2xl p-6 text-white"
                style={{ background: GRADIENTS.purple }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm opacity-75">Current Phase</span>
                    <h2 className="text-xl font-bold mt-1">{currentPhaseData.name}</h2>
                    <p className="text-sm opacity-75 mt-1">{currentPhaseData.dateRange}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{currentPhaseData.completionPercent}%</div>
                    <span className="text-sm opacity-75">Complete</span>
                  </div>
                </div>
                <p className="mt-4 text-sm opacity-90">{currentPhaseData.goal}</p>

                {/* Progress bar */}
                <div className="mt-4 h-2 rounded-full bg-white/20">
                  <motion.div
                    className="h-full rounded-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentPhaseData.completionPercent}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            )}

            {/* Phase Timeline */}
            <div className="space-y-4">
              {data.phases.map((phase) => (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  isExpanded={expandedPhase === phase.id}
                  isCurrent={phase.id === data.currentPhase}
                  onToggle={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                />
              ))}
            </div>

            {/* Action Cards */}
            {data.actions && data.actions.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.textHeading }}>
                  Priority Actions
                </h2>
                <div className="space-y-3">
                  {data.actions.slice(0, 5).map((action, i) => (
                    <ActionCard key={action.id} action={action} number={i + 1} />
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BaselineCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-6 border" style={{ borderColor: COLORS.borderDefault }}>
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: COLORS.secondary }}>{icon}</span>
        <h3 className="font-semibold" style={{ color: COLORS.textHeading }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function PhaseCard({
  phase,
  isExpanded,
  isCurrent,
  onToggle
}: {
  phase: GamePlanPhase;
  isExpanded: boolean;
  isCurrent: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border transition-all ${isCurrent ? 'ring-2 ring-[#667eea]' : ''
        }`}
      style={{ borderColor: COLORS.borderDefault }}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <div>
            <h4 className="font-medium" style={{ color: COLORS.textHeading }}>
              {phase.name}
              {isCurrent && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                  Current
                </span>
              )}
            </h4>
            <span className="text-sm" style={{ color: COLORS.textMuted }}>{phase.dateRange}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 h-2 rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${phase.completionPercent}%` }}
            />
          </div>
          <span className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
            {phase.completionPercent}%
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t" style={{ borderColor: COLORS.borderDefault }}>
              <p className="text-sm mt-4 mb-4" style={{ color: COLORS.textSecondary }}>
                {phase.goal}
              </p>
              <div className="space-y-2">
                {phase.milestones.map((milestone) => {
                  const statusConfig = {
                    completed: { icon: Check, color: STATUS_COLORS.completed },
                    in_progress: { icon: Clock, color: STATUS_COLORS.in_progress },
                    pending: { icon: AlertCircle, color: STATUS_COLORS.pending },
                  };
                  const config = statusConfig[milestone.status];
                  const Icon = config.icon;

                  return (
                    <div
                      key={milestone.id}
                      className="flex items-center gap-3 p-2 rounded-lg"
                      style={{ backgroundColor: config.color.bg }}
                    >
                      <Icon size={16} style={{ color: config.color.text }} />
                      <span className="flex-1 text-sm">{milestone.title}</span>
                      <span className="text-xs" style={{ color: COLORS.textMuted }}>
                        {milestone.targetDate}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GamePlanTab;
