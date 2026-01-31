/**
 * OpportunityAgentCard Component
 * v4.0 - Uses game plan orchestration data for programs
 */
'use client';

import { GraduationCap, AlertTriangle, Calendar, TrendingUp, Star } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { useGamePlan, useOpportunityAlerts } from '@/hooks/useAgentData';
import { AgentCardBase } from './AgentCardBase';

interface OpportunityAlert {
  urgency: string;
  opportunity_name: string;
  deadline: string;
  months_remaining: number;
}

interface OpportunityAgentCardProps {
  profileId: string;
  onChat?: () => void;
  onViewDetails?: (data: Record<string, unknown>) => void;
}

export function OpportunityAgentCard({ profileId, onChat, onViewDetails }: OpportunityAgentCardProps) {
  const { data: gamePlan, isLoading: planLoading, refetch: refetchPlan } = useGamePlan(profileId);
  const { data: alertsData, isLoading: alertsLoading, isError, refetch: refetchAlerts } = useOpportunityAlerts(profileId);

  const isLoading = planLoading || alertsLoading;

  // Get programs data from game plan orchestration
  // NOTE: Programs does NOT have a portfolio structure like Awards
  // It has: top_recommendations, advance_alerts, synergy_recommendations, timeline, strategic_insights
  const gamePlanPrograms = gamePlan?.game_plan?.programs as Record<string, unknown> | undefined;
  const topRecommendations = (gamePlanPrograms?.top_recommendations as Record<string, unknown>[]) || [];
  const advanceAlerts = (gamePlanPrograms?.advance_alerts as Record<string, unknown>[]) || [];

  // Get summary stats
  const summary = gamePlan?.game_plan?.summary as Record<string, number> | undefined;
  const totalProgramsMatched = summary?.total_programs_matched || topRecommendations.length;

  const handleRefresh = () => {
    refetchPlan();
    refetchAlerts();
  };

  const handleClick = () => {
    if (onViewDetails) {
      // v5.0: Get Programs-specific ReAct data from _react_by_agent or programs._react
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gamePlanAny = gamePlan as any;
      const programsReact =
        gamePlanAny?._react_by_agent?.programs ||
        gamePlanPrograms?._react ||
        gamePlan?.game_plan?._react;

      onViewDetails({
        programs: topRecommendations,
        total_matched: totalProgramsMatched,
        top_recommendations: topRecommendations,
        advance_alerts: advanceAlerts,
        synergy_recommendations: gamePlanPrograms?.synergy_recommendations,
        strategic_insights: gamePlanPrograms?.strategic_insights,
        alerts: alertsData?.alerts || [],
        urgent_count: alertsData?.urgent_count || 0,
        // v5.0: Include Programs-specific ReAct metadata for cycle visualization
        _react: programsReact,
      } as Record<string, unknown>);
    }
  };

  // Get data
  const matchCount = totalProgramsMatched;
  const urgentCount = alertsData?.urgent_count || 0;
  const alertCount = alertsData?.alerts?.length || 0;

  // Get upcoming deadlines
  const upcomingAlerts = alertsData?.alerts?.slice(0, 2) || [];

  return (
    <AgentCardBase
      title="Programs Agent"
      icon={<GraduationCap size={20} style={{ color: BRAND_COLORS.primary }} />}
      isLoading={isLoading}
      isError={isError}
      onRefresh={handleRefresh}
      onChat={onChat}
      onClick={handleClick}
      headerBadge={
        urgentCount > 0 && (
          <span
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1"
            style={{
              backgroundColor: BRAND_COLORS.bgError,
              color: BRAND_COLORS.error,
            }}
          >
            <AlertTriangle size={12} />
            {urgentCount} urgent
          </span>
        )
      }
    >
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {/* Programs Matched */}
          <div
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: BRAND_COLORS.primaryBg }}
          >
            <TrendingUp size={16} style={{ color: BRAND_COLORS.primary }} className="mx-auto mb-1" />
            <div
              className="text-2xl font-bold"
              style={{ color: BRAND_COLORS.primary }}
            >
              {matchCount}
            </div>
            <div className="text-xs" style={{ color: BRAND_COLORS.primary }}>
              Programs
            </div>
          </div>

          {/* Alerts */}
          <div
            className="p-3 rounded-lg text-center"
            style={{
              backgroundColor: alertCount > 0 ? BRAND_COLORS.bgWarning : BRAND_COLORS.bgSecondary,
            }}
          >
            <Calendar
              size={16}
              style={{ color: alertCount > 0 ? BRAND_COLORS.warning : BRAND_COLORS.textMuted }}
              className="mx-auto mb-1"
            />
            <div
              className="text-2xl font-bold"
              style={{ color: alertCount > 0 ? BRAND_COLORS.warning : BRAND_COLORS.textMuted }}
            >
              {alertCount}
            </div>
            <div
              className="text-xs"
              style={{ color: alertCount > 0 ? BRAND_COLORS.warning : BRAND_COLORS.textMuted }}
            >
              Deadlines
            </div>
          </div>
        </div>

        {/* Top Programs from Game Plan */}
        {topRecommendations.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: BRAND_COLORS.textMuted }}>
              Top Matched Programs
            </p>
            {topRecommendations.slice(0, 2).map((program: unknown, i: number) => {
              const p = program as { name?: string; organization?: string; fit_score?: number; type?: string };
              return (
                <div
                  key={i}
                  className="p-2 rounded-lg flex items-start justify-between"
                  style={{ backgroundColor: BRAND_COLORS.bgSuccess }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium line-clamp-1"
                      style={{ color: BRAND_COLORS.textHeading }}
                    >
                      {p.name || 'Unknown Program'}
                    </p>
                    <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                      {p.organization || p.type || ''}
                    </p>
                  </div>
                  {p.fit_score !== undefined && (
                    <div className="text-right flex-shrink-0 ml-2">
                      <span
                        className="text-xs font-medium"
                        style={{ color: BRAND_COLORS.success }}
                      >
                        {Math.round(p.fit_score * 100)}%
                      </span>
                      <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                        fit
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : upcomingAlerts.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: BRAND_COLORS.textMuted }}>
              Upcoming Deadlines
            </p>
            {upcomingAlerts.map((alert: OpportunityAlert, i: number) => (
              <div
                key={i}
                className="p-2 rounded-lg flex items-start gap-2"
                style={{
                  backgroundColor:
                    alert.urgency === 'URGENT' ? BRAND_COLORS.bgError : BRAND_COLORS.bgWarning,
                }}
              >
                <AlertTriangle
                  size={14}
                  style={{
                    color:
                      alert.urgency === 'URGENT' ? BRAND_COLORS.error : BRAND_COLORS.warning,
                  }}
                  className="flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium line-clamp-1"
                    style={{ color: BRAND_COLORS.textHeading }}
                  >
                    {alert.opportunity_name}
                  </p>
                  <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                    {alert.months_remaining <= 1
                      ? `Due: ${alert.deadline}`
                      : `${alert.months_remaining} months`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
          >
            <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
              Loading program matches...
            </p>
            <p className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
              Refresh to see recommendations
            </p>
          </div>
        )}

        {/* Strategic Insights from Programs */}
        {Array.isArray(gamePlanPrograms?.strategic_insights) && (gamePlanPrograms.strategic_insights as unknown[]).length > 0 && (
          <div className="flex items-start gap-1 text-xs" style={{ color: BRAND_COLORS.info }}>
            <Star size={12} className="flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {(() => {
                const insight = (gamePlanPrograms.strategic_insights as unknown[])[0];
                if (typeof insight === 'string') return insight;
                if (insight && typeof insight === 'object' && 'message' in insight) return String((insight as { message: string }).message);
                if (insight && typeof insight === 'object' && 'title' in insight) return String((insight as { title: string }).title);
                return '';
              })()}
            </span>
          </div>
        )}

        {/* Summary Stats */}
        <div className="text-xs text-center" style={{ color: BRAND_COLORS.textMuted }}>
          {topRecommendations.length} in portfolio • Click for details
        </div>
      </div>
    </AgentCardBase>
  );
}

export default OpportunityAgentCard;
