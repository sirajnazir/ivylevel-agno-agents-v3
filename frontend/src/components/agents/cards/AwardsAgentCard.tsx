/**
 * AwardsAgentCard Component
 * v4.0 - Uses game plan orchestration data with reach/target/safety portfolio
 */
'use client';

import { Award, Target, Zap, Shield } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { useGamePlan, useAwardMatches } from '@/hooks/useAgentData';
import { AgentCardBase } from './AgentCardBase';

interface AwardsAgentCardProps {
  profileId: string;
  onChat?: () => void;
  onViewDetails?: (data: Record<string, unknown>) => void;
}

export function AwardsAgentCard({ profileId, onChat, onViewDetails }: AwardsAgentCardProps) {
  const { data: gamePlan, isLoading: planLoading, refetch: refetchPlan } = useGamePlan(profileId);
  const { data: matchData, isLoading: matchLoading, isError: matchError, refetch: refetchMatch } = useAwardMatches(profileId);

  const isLoading = planLoading || matchLoading;
  const isError = matchError;

  // Get awards portfolio from game plan (orchestrated) or fallback to legacy match endpoint
  const gamePlanAwards = gamePlan?.game_plan?.awards as Record<string, unknown> | undefined;
  const gamePlanPortfolio = gamePlanAwards?.portfolio as Record<string, unknown[]> | undefined;
  const legacyPortfolio = matchData?.portfolio;

  // Use game plan data if available (has reach/target/safety)
  const portfolio = gamePlanPortfolio || legacyPortfolio;

  // Extract counts - support both new (reach/target/safety) and old (likely/target/stretch) field names
  const reachCount = (portfolio?.reach as unknown[])?.length || (legacyPortfolio?.likely as unknown[])?.length || 0;
  const targetCount = (portfolio?.target as unknown[])?.length || 0;
  const safetyCount = (portfolio?.safety as unknown[])?.length || (legacyPortfolio?.stretch as unknown[])?.length || 0;
  const totalCount = reachCount + targetCount + safetyCount;

  // Get summary stats
  const summary = gamePlan?.game_plan?.summary as Record<string, number> | undefined;
  const totalAwardsMatched = summary?.total_awards_matched || totalCount;

  const handleClick = () => {
    if (onViewDetails) {
      // v5.0: Get Awards-specific ReAct data from _react_by_agent or awards._react
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gamePlanAny = gamePlan as any;
      const awardsReact =
        gamePlanAny?._react_by_agent?.awards ||
        gamePlanAwards?._react ||
        gamePlan?.game_plan?._react;

      onViewDetails({
        portfolio: gamePlanPortfolio || legacyPortfolio,
        matches: matchData?.matches || [],
        total_matched: totalAwardsMatched,
        top_recommendations: gamePlanAwards?.top_recommendations,
        strategic_insights: gamePlanAwards?.strategic_insights,
        // v5.0: Include Awards-specific ReAct metadata for cycle visualization
        _react: awardsReact,
      } as Record<string, unknown>);
    }
  };

  const handleRefresh = () => {
    refetchPlan();
    refetchMatch();
  };

  return (
    <AgentCardBase
      title="Awards Agent"
      icon={<Award size={20} style={{ color: BRAND_COLORS.primary }} />}
      isLoading={isLoading}
      isError={isError}
      onRefresh={handleRefresh}
      onChat={onChat}
      onClick={handleClick}
    >
      <div className="space-y-4">
        {/* Reach/Target/Safety Portfolio */}
        <div className="grid grid-cols-3 gap-2">
          {/* Reach */}
          <div
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: BRAND_COLORS.primaryBg }}
          >
            <Zap size={16} style={{ color: BRAND_COLORS.primary }} className="mx-auto mb-1" />
            <div
              className="text-xl font-bold"
              style={{ color: BRAND_COLORS.primary }}
            >
              {reachCount}
            </div>
            <div className="text-xs" style={{ color: BRAND_COLORS.primary }}>
              Reach
            </div>
          </div>

          {/* Target */}
          <div
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: BRAND_COLORS.bgWarning }}
          >
            <Target size={16} style={{ color: BRAND_COLORS.warning }} className="mx-auto mb-1" />
            <div
              className="text-xl font-bold"
              style={{ color: BRAND_COLORS.warning }}
            >
              {targetCount}
            </div>
            <div className="text-xs" style={{ color: BRAND_COLORS.warning }}>
              Target
            </div>
          </div>

          {/* Safety */}
          <div
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: BRAND_COLORS.bgSuccess }}
          >
            <Shield size={16} style={{ color: BRAND_COLORS.success }} className="mx-auto mb-1" />
            <div
              className="text-xl font-bold"
              style={{ color: BRAND_COLORS.success }}
            >
              {safetyCount}
            </div>
            <div className="text-xs" style={{ color: BRAND_COLORS.success }}>
              Safety
            </div>
          </div>
        </div>

        {/* Total Matched from Orchestration */}
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: BRAND_COLORS.bgSecondary,
            border: `1px solid ${BRAND_COLORS.borderLight}`,
          }}
        >
          <div className="flex items-center justify-between">
            <span style={{ color: BRAND_COLORS.textMuted }} className="text-sm">
              Total Awards Matched
            </span>
            <span
              className="text-lg font-bold"
              style={{ color: BRAND_COLORS.success }}
            >
              {totalAwardsMatched}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
            From orchestrated matching
          </p>
        </div>

        {/* Strategic Insights */}
        {Array.isArray(gamePlanAwards?.strategic_insights) && (gamePlanAwards.strategic_insights as unknown[]).length > 0 && (
          <div>
            <p className="text-xs mb-1" style={{ color: BRAND_COLORS.textMuted }}>
              Strategy Insight
            </p>
            <p className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
              {(() => {
                const insight = (gamePlanAwards.strategic_insights as unknown[])[0];
                if (typeof insight === 'string') return insight;
                if (insight && typeof insight === 'object' && 'message' in insight) return String((insight as {message: string}).message);
                if (insight && typeof insight === 'object' && 'title' in insight) return String((insight as {title: string}).title);
                return '';
              })()}
            </p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="text-xs text-center" style={{ color: BRAND_COLORS.textMuted }}>
          {totalCount} in portfolio • Click for details
        </div>
      </div>
    </AgentCardBase>
  );
}

export default AwardsAgentCard;
