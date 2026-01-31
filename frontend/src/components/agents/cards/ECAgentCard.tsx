/**
 * ECAgentCard Component
 * v4.0 - Displays Extracurricular Activities from game plan orchestration
 *
 * Specializes in:
 * - Listing and categorizing activities
 * - Showing activity portfolio balance
 * - Displaying activity recommendations
 */
'use client';

import { Activity, Briefcase, Heart, Users, Lightbulb, ChevronRight, Sparkles, Target } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { useGamePlan } from '@/hooks/useAgentData';
import { useProfileIdentity } from '@/hooks/useProfileIdentity';
import { AgentCardBase } from './AgentCardBase';

interface ECAgentCardProps {
  profileId: string;
  onChat?: () => void;
  onViewDetails?: (data: Record<string, unknown>) => void;
}

// Activity type icons
const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  academic: <Briefcase size={14} />,
  service: <Heart size={14} />,
  leadership: <Users size={14} />,
  creative: <Lightbulb size={14} />,
  default: <Activity size={14} />,
};

export function ECAgentCard({ profileId, onChat, onViewDetails }: ECAgentCardProps) {
  const { data: gamePlan, isLoading: gamePlanLoading, isError, refetch } = useGamePlan(profileId);

  // v5.3: Identity data from canonical source (profiles table), NOT from gamePlan
  const { data: profileIdentity, isLoading: identityLoading } = useProfileIdentity(profileId);

  const isLoading = gamePlanLoading || identityLoading;

  // v5.0: Extract EC Generation Engine data (proper EC activities like signature projects, leadership, etc.)
  const ecGeneration = (gamePlan?.game_plan?.ec_generation as Record<string, unknown>) || {};
  const ecEngineActivities = (ecGeneration.recommended_activities as Array<{
    name?: string;
    title?: string;
    activity_type?: string;
    description?: string;
  }>) || [];

  // Fallback to game_plan activities if no EC Engine activities
  const gamePlanActivities = (gamePlan?.game_plan?.activities as Array<{
    name?: string;
    type?: string;
    category?: string;
    description?: string;
    touchpoints?: string[];
  }>) || [];

  // Use EC Engine activities if available, otherwise use game plan activities (filtered)
  // Filter out awards/programs from gamePlan activities (they come from other agents)
  const filteredGamePlanActivities = gamePlanActivities.filter(a => {
    const cat = (a.category || a.type || '').toLowerCase();
    return !['award', 'program', 'awards', 'programs'].includes(cat);
  });

  // Prefer EC Engine activities (signature projects, leadership, etc.)
  const activities = ecEngineActivities.length > 0
    ? ecEngineActivities.map(a => ({ name: a.title || a.name, type: a.activity_type, ...a }))
    : filteredGamePlanActivities;

  // Get identity seeds that relate to activities
  const seeds = (gamePlan?.game_plan?.identity_seeds as Array<{
    name?: string;
    type?: string;
    planted?: boolean;
  }>) || [];

  // v5.3: Identity synthesis from profiles table (canonical source)
  // Fallback to gamePlan's identity_synthesis only if profile identity unavailable
  const identitySynthesis = {
    spike: profileIdentity?.spike || '',
    archetype: profileIdentity?.archetypeName || '',
    pillars: profileIdentity?.pillars || [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...((!profileIdentity?.spike && !profileIdentity?.archetypeName) ? (gamePlan?.game_plan?.identity_synthesis as any) || {} : {}),
  };

  // Categorize activities
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categorizedActivities = activities.reduce((acc: Record<string, any[]>, act) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actAny = act as any;
    const category = actAny.category || actAny.type || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(act);
    return acc;
  }, {});

  const categories = Object.keys(categorizedActivities);
  const plantedSeeds = seeds.filter(s => s.planted).length;

  const handleClick = () => {
    if (onViewDetails) {
      // v5.3: Only include EC-specific ReAct data, NOT gamePlan's agent-level _react
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gamePlanAny = gamePlan as any;
      const ecReact = gamePlanAny?._react_by_agent?.ec || null;

      onViewDetails({
        activities,
        identity_seeds: seeds,
        categories: categorizedActivities,
        total_activities: activities.length,
        planted_seeds: plantedSeeds,
        ec_generation: ecGeneration,
        // v5.3: Identity from profiles table (canonical source)
        identity_synthesis: identitySynthesis,
        spike: identitySynthesis.spike,
        archetype: identitySynthesis.archetype,
        pillars: identitySynthesis.pillars,
        // v5.3: Only EC-specific ReAct metadata (no fallback to gamePlan._react)
        _react: ecReact,
      } as Record<string, unknown>);
    }
  };

  // v5.2: Show identity data even when activities are empty
  const hasActivities = activities.length > 0;
  const hasIdentityData = !!(identitySynthesis.spike || identitySynthesis.archetype);
  const hasAnyData = hasActivities || hasIdentityData || seeds.length > 0;

  // Format archetype for display
  const formatArchetype = (archetype: string) => {
    if (!archetype) return '';
    return archetype.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <AgentCardBase
      title="EC Agent"
      icon={<Activity size={20} style={{ color: BRAND_COLORS.primary }} />}
      isLoading={isLoading}
      isError={isError}
      onRefresh={() => refetch()}
      onChat={onChat}
      onClick={handleClick}
    >
      {hasAnyData ? (
        <div className="space-y-3">
          {/* Identity Synthesis Section - Always show if available */}
          {hasIdentityData && (
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: BRAND_COLORS.primaryBg,
                border: `1px solid ${BRAND_COLORS.primary}30`,
              }}
            >
              {/* Spike */}
              {identitySynthesis.spike && (
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={12} style={{ color: BRAND_COLORS.primary }} />
                    <span className="text-xs font-medium" style={{ color: BRAND_COLORS.primary }}>
                      Identity Spike
                    </span>
                  </div>
                  <p className="text-sm font-medium line-clamp-2" style={{ color: BRAND_COLORS.textHeading }}>
                    {identitySynthesis.spike}
                  </p>
                </div>
              )}
              {/* Archetype */}
              {identitySynthesis.archetype && (
                <div className="flex items-center gap-2">
                  <Target size={12} style={{ color: BRAND_COLORS.textMuted }} />
                  <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                    Archetype:
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: BRAND_COLORS.secondary, color: 'white' }}
                  >
                    {formatArchetype(identitySynthesis.archetype)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Activity Stats - Only if we have activities */}
          {hasActivities && (
            <div className="grid grid-cols-2 gap-2">
              <div
                className="p-3 rounded-lg text-center"
                style={{ backgroundColor: BRAND_COLORS.primaryBg }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: BRAND_COLORS.primary }}
                >
                  {activities.length}
                </div>
                <div className="text-xs" style={{ color: BRAND_COLORS.primary }}>
                  Activities
                </div>
              </div>
              <div
                className="p-3 rounded-lg text-center"
                style={{ backgroundColor: BRAND_COLORS.bgSuccess }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: BRAND_COLORS.success }}
                >
                  {plantedSeeds}
                </div>
                <div className="text-xs" style={{ color: BRAND_COLORS.success }}>
                  Seeds Planted
                </div>
              </div>
            </div>
          )}

          {/* Activity Categories */}
          {categories.length > 0 && (
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: BRAND_COLORS.bgSecondary,
                border: `1px solid ${BRAND_COLORS.borderLight}`,
              }}
            >
              <p
                className="text-xs font-medium mb-2"
                style={{ color: BRAND_COLORS.textMuted }}
              >
                Activity Categories
              </p>
              <div className="space-y-1.5">
                {categories.slice(0, 4).map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: BRAND_COLORS.primary }}>
                        {ACTIVITY_ICONS[category.toLowerCase()] || ACTIVITY_ICONS.default}
                      </span>
                      <span style={{ color: BRAND_COLORS.textPrimary }}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: BRAND_COLORS.primaryBg,
                        color: BRAND_COLORS.primary,
                      }}
                    >
                      {categorizedActivities[category].length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Activities Preview */}
          {activities.length > 0 && (
            <div className="space-y-1.5">
              <p
                className="text-xs font-medium"
                style={{ color: BRAND_COLORS.textMuted }}
              >
                Recommended Activities
              </p>
              {activities.slice(0, 2).map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm"
                  style={{ color: BRAND_COLORS.textPrimary }}
                >
                  <ChevronRight
                    size={14}
                    style={{ color: BRAND_COLORS.primary }}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <span className="line-clamp-1">{activity.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Show message when we have identity but no activities */}
          {!hasActivities && hasIdentityData && (
            <div
              className="p-2 rounded-lg text-center"
              style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
            >
              <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                Activity generation in progress
              </p>
            </div>
          )}

          {/* Summary */}
          <div
            className="text-xs text-center"
            style={{ color: BRAND_COLORS.textMuted }}
          >
            {hasActivities
              ? `${categories.length} categories • Click for details`
              : 'Click for identity details'}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <Activity size={32} style={{ color: BRAND_COLORS.textMuted }} className="mx-auto mb-2 opacity-40" />
          <p style={{ color: BRAND_COLORS.textMuted }} className="text-sm">
            {isLoading ? 'Analyzing your profile...' : 'No data available yet'}
          </p>
          <p className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
            Click to generate
          </p>
        </div>
      )}
    </AgentCardBase>
  );
}

export default ECAgentCard;
