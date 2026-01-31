/**
 * GamePlanAgentCard Component
 * v13.4 - Added spike indicator from Strategic Intelligence
 */
'use client';

import { Target, Calendar, Sprout } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { useGamePlan, useFilteredActivities, useIdentitySeeds } from '@/hooks/useAgentData';
import { useResultsStore } from '@/lib/store/useResultsStore';
import { AgentCardBase } from './AgentCardBase';
import { SpikeIndicator } from '@/components/ui/SpikeIndicator';

interface GamePlanAgentCardProps {
  profileId: string;
  onChat?: () => void;
  onViewDetails?: (data: Record<string, unknown>) => void;
}

export function GamePlanAgentCard({ profileId, onChat, onViewDetails }: GamePlanAgentCardProps) {
  const { data: gamePlan, isLoading: planLoading, isError: planError, refetch: refetchPlan } = useGamePlan(profileId);
  const { data: activities, isLoading: activitiesLoading } = useFilteredActivities(profileId);
  const { data: seeds, isLoading: seedsLoading } = useIdentitySeeds(profileId);
  const identity_synthesis = useResultsStore((state) => state.identity_synthesis);
  const priority_actions = useResultsStore((state) => state.priority_actions);

  const isLoading = planLoading || activitiesLoading || seedsLoading;
  const isError = planError;

  const handleRefresh = () => {
    refetchPlan();
  };

  const handleClick = () => {
    if (onViewDetails && gamePlan) {
      // Include _react at top level for modal to find it
      onViewDetails({
        ...gamePlan,
        ...gamePlan.game_plan,
        // v5.0: Include ReAct metadata for cycle visualization
        _react: gamePlan.game_plan?._react,
      } as unknown as Record<string, unknown>);
    }
  };

  // Extract counts from data
  const activityCount = gamePlan?.game_plan?.activities?.length || activities?.activities?.length || 0;
  const seedCount = gamePlan?.game_plan?.identity_seeds?.length || seeds?.seeds?.length || 0;
  const phaseCount = gamePlan?.game_plan?.phases?.length || 3;

  return (
    <AgentCardBase
      title="Game Plan Agent"
      icon={<Target size={20} style={{ color: BRAND_COLORS.primary }} />}
      isLoading={isLoading}
      isError={isError}
      onRefresh={handleRefresh}
      onChat={onChat}
      onClick={handleClick}
    >
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Activities */}
          <div
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
          >
            <div
              className="text-2xl font-bold"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              {activityCount}
            </div>
            <div className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
              Activities
            </div>
          </div>

          {/* Seeds */}
          <div
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
          >
            <div className="flex items-center justify-center mb-1">
              <Sprout size={16} style={{ color: BRAND_COLORS.success }} />
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              {seedCount}
            </div>
            <div className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
              Seeds
            </div>
          </div>

          {/* Phases */}
          <div
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
          >
            <div className="flex items-center justify-center mb-1">
              <Calendar size={16} style={{ color: BRAND_COLORS.info }} />
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              {phaseCount}
            </div>
            <div className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
              Phases
            </div>
          </div>
        </div>

        {/* Current Phase */}
        {gamePlan?.game_plan?.phases?.[0] && (
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: BRAND_COLORS.primaryBg,
              border: `1px solid ${BRAND_COLORS.primary}20`,
            }}
          >
            <p className="text-xs font-medium" style={{ color: BRAND_COLORS.primary }}>
              Current Phase
            </p>
            <p
              className="text-sm font-semibold mt-1"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              {gamePlan.game_plan.phases[0].name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: BRAND_COLORS.textMuted }}>
              {gamePlan.game_plan.phases[0].duration}
            </p>
          </div>
        )}

        {/* Spike Indicator (Strategic Intelligence v1.1.0) */}
        {identity_synthesis?.spike && (
          <div className="pt-2 border-t" style={{ borderColor: BRAND_COLORS.borderLight }}>
            <SpikeIndicator spike={identity_synthesis.spike} variant="compact" size="sm" />
          </div>
        )}

        {/* Priority Actions Preview */}
        {priority_actions && priority_actions.length > 0 && (
          <div className="space-y-1.5">
            {priority_actions.slice(0, 2).map((action, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span
                  className="px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0"
                  style={{
                    backgroundColor: action.priority === 'high' ? '#fee2e2' : '#fef3c7',
                    color: action.priority === 'high' ? '#dc2626' : '#d97706',
                  }}
                >
                  {action.priority}
                </span>
                <span
                  className="text-xs line-clamp-1"
                  style={{ color: BRAND_COLORS.textSecondary }}
                >
                  {action.action}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {gamePlan?.game_plan?.summary && (
          <div className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
            {gamePlan.game_plan.summary.total_touchpoints} touchpoints •
            Avg ROI: {gamePlan.game_plan.summary.average_roi?.toFixed(1) || 'N/A'}
          </div>
        )}
      </div>
    </AgentCardBase>
  );
}

export default GamePlanAgentCard;
