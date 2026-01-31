/**
 * PreparationTab - Weekly Vitals & Action Planning
 * v12.0 - Matches original frontend specification
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, CheckCircle, Circle, ChevronDown, ChevronUp,
  Clock, Target, TrendingUp, AlertTriangle
} from 'lucide-react';
import { COLORS, GRADIENTS } from '@/lib/constants/design';

interface WeeklyTask {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'completed' | 'in_progress' | 'pending';
  dueDate: string;
  estimatedTime: string;
}

interface WeekData {
  weekNumber: number;
  dateRange: string;
  focus: string;
  completionPercent: number;
  tasks: WeeklyTask[];
}

interface PreparationTabProps {
  weeks: WeekData[];
  currentWeek: number;
}

export function PreparationTab({ weeks, currentWeek }: PreparationTabProps) {
  const [expandedWeek, setExpandedWeek] = useState<number>(currentWeek);

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: COLORS.textHeading }}>
          Weekly Action Plan
        </h1>
        <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
          Break down your strategy into actionable weekly goals
        </p>
      </div>

      {/* Week Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weeks.map((week) => (
          <WeekCard
            key={week.weekNumber}
            week={week}
            isExpanded={expandedWeek === week.weekNumber}
            isCurrent={week.weekNumber === currentWeek}
            onToggle={() => setExpandedWeek(
              expandedWeek === week.weekNumber ? -1 : week.weekNumber
            )}
          />
        ))}
      </div>
    </div>
  );
}

function WeekCard({
  week,
  isExpanded,
  isCurrent,
  onToggle,
}: {
  week: WeekData;
  isExpanded: boolean;
  isCurrent: boolean;
  onToggle: () => void;
}) {
  const completedTasks = week.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = week.tasks.length;

  return (
    <motion.div
      layout
      className={`bg-white rounded-xl overflow-hidden transition-all cursor-pointer ${
        isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''
      }`}
      style={{
        borderTop: '3px solid',
        borderImage: isExpanded ? GRADIENTS.purple : GRADIENTS.orange,
        borderImageSlice: 1,
        boxShadow: isExpanded ? '0 8px 24px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
      whileHover={{
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        y: isExpanded ? 0 : -2,
      }}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold" style={{ color: COLORS.textHeading }}>
                Week {week.weekNumber}
              </h3>
              {isCurrent && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-600 font-medium">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
              {week.dateRange}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
              {completedTasks}/{totalTasks}
            </span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {/* Focus */}
        <p className="mt-3 text-sm" style={{ color: COLORS.textSecondary }}>
          <span className="font-medium">Focus:</span> {week.focus}
        </p>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="h-2 rounded-full bg-gray-100">
            <motion.div
              className="h-full rounded-full"
              style={{ background: GRADIENTS.purple }}
              initial={{ width: 0 }}
              animate={{ width: `${week.completionPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t"
            style={{ borderColor: COLORS.borderDefault }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-3">
              {week.tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TaskItem({ task }: { task: WeeklyTask }) {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: COLORS.success,
      bg: '#dcfce7',
    },
    in_progress: {
      icon: Clock,
      color: COLORS.warning,
      bg: '#fef3c7',
    },
    pending: {
      icon: Circle,
      color: COLORS.textMuted,
      bg: '#f3f4f6',
    },
  };

  const config = statusConfig[task.status];
  const Icon = config.icon;

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg"
      style={{ backgroundColor: config.bg }}
    >
      <Icon size={18} style={{ color: config.color }} className="mt-0.5" />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm" style={{ color: COLORS.textHeading }}>
            {task.title}
          </h4>
          <span className="text-xs px-2 py-0.5 rounded bg-white" style={{ color: COLORS.textMuted }}>
            {task.category}
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>
          {task.description}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-xs flex items-center gap-1" style={{ color: COLORS.textMuted }}>
            <Calendar size={12} /> {task.dueDate}
          </span>
          <span className="text-xs flex items-center gap-1" style={{ color: COLORS.textMuted }}>
            <Clock size={12} /> {task.estimatedTime}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PreparationTab;
