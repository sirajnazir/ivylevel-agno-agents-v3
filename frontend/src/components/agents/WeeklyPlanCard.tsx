/**
 * WeeklyPlanCard - Display prioritized weekly tasks
 * v13.0 - P0/P1/P2 task breakdown with Jenny-voiced encouragement
 */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, RefreshCw, Loader2, ChevronDown, ChevronUp, Clock, CheckCircle2 } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { agentV2Api, type WeeklyPlanResult } from '@/lib/api/agentV2Client';
import { useProfileId } from '@/lib/store/useSessionStore';

interface WeeklyPlanCardProps {
  tasks?: Array<{
    id: string;
    name: string;
    priority: 'P0' | 'P1' | 'P2';
    estimated_hours: number;
    deadline?: string;
    category: string;
  }>;
}

const PRIORITY_CONFIG = {
  P0: {
    label: 'MUST COMPLETE',
    color: '#dc2626',
    bgColor: 'rgba(220, 38, 38, 0.1)',
    icon: '🔴',
  },
  P1: {
    label: 'SHOULD COMPLETE',
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.1)',
    icon: '🟡',
  },
  P2: {
    label: 'IF TIME PERMITS',
    color: '#16a34a',
    bgColor: 'rgba(22, 163, 74, 0.1)',
    icon: '🟢',
  },
};

export function WeeklyPlanCard({ tasks = [] }: WeeklyPlanCardProps) {
  const profileId = useProfileId();
  const [plan, setPlan] = useState<WeeklyPlanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const loadPlan = async () => {
    if (!profileId) {
      setError('No profile ID available');
      return;
    }

    // Use provided tasks or default sample
    const taskList = tasks.length > 0 ? tasks : [
      { id: '1', name: 'Complete assessment', priority: 'P0' as const, estimated_hours: 1, category: 'setup' },
    ];

    setIsLoading(true);
    setError(null);

    try {
      const result = await agentV2Api.generateWeeklyPlan({
        profile_id: profileId,
        tasks: taskList,
        available_hours: 20,
      });
      setPlan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      loadPlan();
    }
  }, [profileId, tasks]);

  const calculateTotalHours = (items: Array<{ estimated_hours: number }>) => {
    return items.reduce((sum, item) => sum + item.estimated_hours, 0);
  };

  const weekStart = plan?.plan?.week_start
    ? new Date(plan.plan.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border overflow-hidden"
      style={{ borderColor: BRAND_COLORS.borderLight }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer"
        style={{ backgroundColor: 'rgba(22, 163, 74, 0.05)' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
          >
            <Calendar size={20} style={{ color: BRAND_COLORS.success }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
              This Week&apos;s Plan
            </h3>
            <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
              Week of {weekStart}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              loadPlan();
            }}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" style={{ color: BRAND_COLORS.textMuted }} />
            ) : (
              <RefreshCw size={18} style={{ color: BRAND_COLORS.textMuted }} />
            )}
          </button>
          {isExpanded ? (
            <ChevronUp size={20} style={{ color: BRAND_COLORS.textMuted }} />
          ) : (
            <ChevronDown size={20} style={{ color: BRAND_COLORS.textMuted }} />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 py-4 space-y-4">
          {/* Error State */}
          {error && (
            <div
              className="p-4 rounded-lg text-sm"
              style={{ backgroundColor: BRAND_COLORS.bgError, color: BRAND_COLORS.error }}
            >
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && !plan && (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin mb-3" style={{ color: BRAND_COLORS.success }} />
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Generating your weekly plan...
              </p>
            </div>
          )}

          {/* Content */}
          {plan && !isLoading && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock size={14} style={{ color: BRAND_COLORS.textMuted }} />
                    <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Available</span>
                  </div>
                  <span className="text-lg font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                    {plan.plan?.available_hours || 0}h
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle2 size={14} style={{ color: BRAND_COLORS.textMuted }} />
                    <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Planned</span>
                  </div>
                  <span className="text-lg font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                    {plan.plan?.total_hours_estimated || 0}h
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Buffer</span>
                  </div>
                  <span className="text-lg font-semibold" style={{ color: BRAND_COLORS.success }}>
                    {plan.plan?.buffer_hours || 0}h
                  </span>
                </div>
              </div>

              {/* P0 Tasks */}
              {plan.plan?.p0_must_complete && plan.plan.p0_must_complete.length > 0 && (
                <TaskSection
                  priority="P0"
                  tasks={plan.plan.p0_must_complete}
                  totalHours={calculateTotalHours(plan.plan.p0_must_complete)}
                />
              )}

              {/* P1 Tasks */}
              {plan.plan?.p1_should_complete && plan.plan.p1_should_complete.length > 0 && (
                <TaskSection
                  priority="P1"
                  tasks={plan.plan.p1_should_complete}
                  totalHours={calculateTotalHours(plan.plan.p1_should_complete)}
                />
              )}

              {/* P2 Tasks */}
              {plan.plan?.p2_if_time_permits && plan.plan.p2_if_time_permits.length > 0 && (
                <TaskSection
                  priority="P2"
                  tasks={plan.plan.p2_if_time_permits}
                  totalHours={calculateTotalHours(plan.plan.p2_if_time_permits)}
                />
              )}

              {/* Flexibility Note (Jenny Voice) */}
              {plan.plan?.flexibility_note && (
                <div
                  className="p-3 rounded-lg text-sm italic"
                  style={{
                    backgroundColor: 'rgba(22, 163, 74, 0.05)',
                    color: BRAND_COLORS.textPrimary,
                  }}
                >
                  <span style={{ color: BRAND_COLORS.success }}>💡</span> {plan.plan.flexibility_note}
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!plan && !isLoading && !error && (
            <div className="py-8 text-center">
              <Calendar size={40} className="mx-auto mb-3" style={{ color: BRAND_COLORS.textMuted }} />
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Add tasks to generate your weekly plan
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

interface TaskSectionProps {
  priority: 'P0' | 'P1' | 'P2';
  tasks: Array<{ name: string; estimated_hours: number }>;
  totalHours: number;
}

function TaskSection({ priority, tasks, totalHours }: TaskSectionProps) {
  const config = PRIORITY_CONFIG[priority];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: config.color }}>
          {priority} - {config.label}
        </span>
        <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
          {config.icon} {totalHours}h
        </span>
      </div>
      <div
        className="rounded-lg overflow-hidden"
        style={{ backgroundColor: config.bgColor }}
      >
        {tasks.map((task, idx) => (
          <div
            key={idx}
            className="px-3 py-2 flex items-center justify-between border-b last:border-b-0"
            style={{ borderColor: 'rgba(0,0,0,0.05)' }}
          >
            <span className="text-sm" style={{ color: BRAND_COLORS.textPrimary }}>
              {task.name}
            </span>
            <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
              {task.estimated_hours}h
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeeklyPlanCard;
