/**
 * IvyQuest v10.0 - Dual View Component
 * =====================================
 * ACP-009: Dual-Layer Messaging
 *
 * Same data, different framing for different audiences:
 * - Student View: Empathetic, motivational, growth-focused
 * - Parent View: Quantitative, analytical, data-driven
 *
 * This prevents family conflicts by showing appropriate framing to each audience.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, ChevronDown, TrendingUp, Heart, BarChart3 } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';

type ViewMode = 'student' | 'parent';

interface DualViewData {
  // Shared data
  value: number | string;
  label: string;

  // View-specific content
  student: {
    title: string;
    description: string;
    encouragement?: string;
  };
  parent: {
    title: string;
    description: string;
    metric?: string;
  };
}

interface DualViewProps {
  data: DualViewData[];
  defaultView?: ViewMode;
  showToggle?: boolean;
  className?: string;
}

export function DualView({
  data,
  defaultView = 'student',
  showToggle = true,
  className = '',
}: DualViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);

  return (
    <div className={className}>
      {/* View Toggle */}
      {showToggle && (
        <div className="flex justify-center mb-6">
          <div
            className="inline-flex rounded-full p-1"
            style={{ backgroundColor: BRAND_COLORS.bgPill }}
          >
            <button
              onClick={() => setViewMode('student')}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
              style={{
                backgroundColor:
                  viewMode === 'student' ? BRAND_COLORS.primary : 'transparent',
                color: viewMode === 'student' ? 'white' : BRAND_COLORS.textSecondary,
              }}
            >
              <User size={16} />
              <span className="text-sm font-medium">Student View</span>
            </button>
            <button
              onClick={() => setViewMode('parent')}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
              style={{
                backgroundColor:
                  viewMode === 'parent' ? BRAND_COLORS.secondary : 'transparent',
                color: viewMode === 'parent' ? 'white' : BRAND_COLORS.textSecondary,
              }}
            >
              <Users size={16} />
              <span className="text-sm font-medium">Parent View</span>
            </button>
          </div>
        </div>
      )}

      {/* Content Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {data.map((item, index) => (
            <motion.div
              key={`${viewMode}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.1 }}
            >
              <DualViewCard
                data={item}
                viewMode={viewMode}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface DualViewCardProps {
  data: DualViewData;
  viewMode: ViewMode;
}

function DualViewCard({ data, viewMode }: DualViewCardProps) {
  const content = viewMode === 'student' ? data.student : data.parent;
  const Icon = viewMode === 'student' ? Heart : BarChart3;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: BRAND_COLORS.bgPrimary,
        border: `1px solid ${BRAND_COLORS.borderLight}`,
      }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor:
              viewMode === 'student'
                ? BRAND_COLORS.primaryBg
                : BRAND_COLORS.secondaryBg,
          }}
        >
          <Icon
            size={24}
            style={{
              color:
                viewMode === 'student'
                  ? BRAND_COLORS.primary
                  : BRAND_COLORS.secondary,
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3
              className="font-semibold"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              {content.title}
            </h3>
            {/* Value badge */}
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor:
                  viewMode === 'student'
                    ? BRAND_COLORS.bgSuccess
                    : BRAND_COLORS.bgPill,
                color:
                  viewMode === 'student'
                    ? BRAND_COLORS.success
                    : BRAND_COLORS.textPrimary,
              }}
            >
              {typeof data.value === 'number'
                ? `${data.value}${data.label.includes('%') ? '%' : ''}`
                : data.value}
            </span>
          </div>

          <p
            className="text-sm mb-2"
            style={{ color: BRAND_COLORS.textSecondary }}
          >
            {content.description}
          </p>

          {/* View-specific extra content */}
          {viewMode === 'student' && data.student.encouragement && (
            <p
              className="text-sm italic"
              style={{ color: BRAND_COLORS.primary }}
            >
              {data.student.encouragement}
            </p>
          )}

          {viewMode === 'parent' && data.parent.metric && (
            <div
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
              style={{ backgroundColor: BRAND_COLORS.bgPill }}
            >
              <TrendingUp size={12} style={{ color: BRAND_COLORS.success }} />
              <span style={{ color: BRAND_COLORS.textMuted }}>
                {data.parent.metric}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Preset Dual View Cards
// =====================================================

interface DualViewCRIProps {
  cri: number;
  viewMode?: ViewMode;
}

export function DualViewCRI({ cri, viewMode = 'student' }: DualViewCRIProps) {
  const criBoost = Math.round((cri - 1) * 100);

  const data: DualViewData = {
    value: criBoost > 0 ? `+${criBoost}%` : `${criBoost}%`,
    label: 'CRI Boost',
    student: {
      title: 'Your Superpower Boost',
      description: 'Your barriers are actually your superpowers. What you\'ve overcome makes your story stronger.',
      encouragement: 'You\'re growing! Every challenge has made you more resilient.',
    },
    parent: {
      title: 'Context Relativity Index',
      description: `CRI: ${cri.toFixed(2)} - Performance relative to expected outcomes given demographic context.`,
      metric: 'Based on Chetty mobility data',
    },
  };

  return <DualViewCard data={data} viewMode={viewMode} />;
}

interface DualViewProgressProps {
  completionRate: number;
  tasksCompleted: number;
  totalTasks: number;
  viewMode?: ViewMode;
}

export function DualViewProgress({
  completionRate,
  tasksCompleted,
  totalTasks,
  viewMode = 'student',
}: DualViewProgressProps) {
  const data: DualViewData = {
    value: Math.round(completionRate * 100),
    label: '% complete',
    student: {
      title: 'Your Progress',
      description: `You\'re making great strides! ${tasksCompleted} actions completed.`,
      encouragement: 'Keep going - every small step counts!',
    },
    parent: {
      title: 'Task Completion Rate',
      description: `${tasksCompleted}/${totalTasks} tasks completed. Strategic Overwhelm target: 73%.`,
      metric: `${Math.round(completionRate * 100)}% completion rate`,
    },
  };

  return <DualViewCard data={data} viewMode={viewMode} />;
}

interface DualViewCrisisProps {
  crisisType: string;
  status: 'detected' | 'proposed' | 'resolved';
  viewMode?: ViewMode;
}

export function DualViewCrisis({
  crisisType,
  status,
  viewMode = 'student',
}: DualViewCrisisProps) {
  const statusLabels = {
    detected: { student: 'Working on it', parent: 'Intervention in progress' },
    proposed: { student: 'Ready to help', parent: 'Awaiting approval' },
    resolved: { student: 'Turned around!', parent: 'Resolved successfully' },
  };

  const data: DualViewData = {
    value: statusLabels[status][viewMode],
    label: 'Status',
    student: {
      title: 'Let\'s Turn This Around',
      description: 'Every setback is a setup for a comeback. We\'ve got a plan.',
      encouragement: 'You\'ve got this. Let\'s find the opportunity here.',
    },
    parent: {
      title: 'Crisis Management',
      description: `${crisisType} detected. Crisis Alchemy protocol activated.`,
      metric: 'Target recovery: <72 hours',
    },
  };

  return <DualViewCard data={data} viewMode={viewMode} />;
}

// =====================================================
// Export Components
// =====================================================

export default DualView;
