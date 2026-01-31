/**
 * AgentDetailModal Component
 * v13.3 - Expanded detail view for agent cards
 *
 * Features:
 * - Full-screen modal with detailed agent data
 * - Different views for each agent type
 * - Scrollable content with sections
 */
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { X, Brain, Target, Award, Lightbulb, AlertTriangle, Zap, Calendar, Clock, CheckCircle2, TrendingUp, GraduationCap, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { ReActVisualization } from './react';
import { FourPillarsGrid, TenDimensionsAccordion, ActivityOutputCard } from './ec-engine';
import type { ReactMetadata, FourPillarsData, TenDimensionsData, GeneratedActivity } from '@/lib/types/react-visualization';

export type AgentType = 'assessment' | 'ec' | 'gameplan' | 'execution' | 'awards' | 'opportunity' | 'crisis';

interface AgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentType: AgentType;
  title: string;
  data: Record<string, unknown> | null;
}

/**
 * v5.0: Extract per-agent ReAct data from orchestration result
 *
 * The GamePlan orchestrator stores individual agent _react data in:
 * - _react_by_agent: { ec: {...}, awards: {...}, programs: {...} }
 * - Or embedded in sections: identity_synthesis._react, awards._react, programs._react
 */
function getReactDataForAgent(
  data: Record<string, unknown> | null,
  agentType: AgentType
): ReactMetadata | undefined {
  if (!data) return undefined;

  // Extract _react_by_agent if available (v5.0 structure)
  const reactByAgent = data._react_by_agent as Record<string, ReactMetadata> | undefined;

  // Get game_plan if present (data may be wrapped)
  const gamePlan = data.game_plan as Record<string, unknown> | undefined;
  const gamePlanReactByAgent = gamePlan?._react_by_agent as Record<string, ReactMetadata> | undefined;

  switch (agentType) {
    case 'ec':
      // EC Agent: check _react_by_agent.ec or identity_synthesis._react
      return (
        reactByAgent?.ec ||
        gamePlanReactByAgent?.ec ||
        (data.identity_synthesis as Record<string, unknown>)?._react as ReactMetadata ||
        (gamePlan?.identity_synthesis as Record<string, unknown>)?._react as ReactMetadata ||
        data._react as ReactMetadata // fallback to top-level
      );

    case 'awards':
      // Awards Agent: check _react_by_agent.awards or awards._react
      return (
        reactByAgent?.awards ||
        gamePlanReactByAgent?.awards ||
        (data.awards as Record<string, unknown>)?._react as ReactMetadata ||
        (gamePlan?.awards as Record<string, unknown>)?._react as ReactMetadata ||
        data._react as ReactMetadata
      );

    case 'opportunity':
      // Programs Agent: check _react_by_agent.programs or programs._react
      return (
        reactByAgent?.programs ||
        gamePlanReactByAgent?.programs ||
        (data.programs as Record<string, unknown>)?._react as ReactMetadata ||
        (gamePlan?.programs as Record<string, unknown>)?._react as ReactMetadata ||
        data._react as ReactMetadata
      );

    case 'gameplan':
      // GamePlan orchestrator: use top-level _react (orchestrator's own cycles)
      return data._react as ReactMetadata || gamePlan?._react as ReactMetadata;

    default:
      // Other agents: use top-level _react if available
      return data._react as ReactMetadata;
  }
}

export function AgentDetailModal({
  isOpen,
  onClose,
  agentType,
  title,
  data,
}: AgentDetailModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (!data) {
      return (
        <div className="text-center py-8" style={{ color: BRAND_COLORS.textMuted }}>
          No data available
        </div>
      );
    }

    // v5.0: Extract per-agent ReAct metadata using helper
    const reactData = getReactDataForAgent(data, agentType);
    const hasReactData = reactData && reactData.cycle_summary && reactData.cycle_summary.length > 0;

    // Debug logging for ReAct visualization
    console.log('[AgentDetailModal] Agent type:', agentType);
    console.log('[AgentDetailModal] Data keys:', Object.keys(data));
    console.log('[AgentDetailModal] _react_by_agent present:', !!(data._react_by_agent));
    console.log('[AgentDetailModal] Per-agent _react found:', !!reactData);
    if (reactData) {
      console.log('[AgentDetailModal] _react data:', {
        agentName: reactData.agent_name,
        cycles: reactData.cycles_executed,
        hasCycleSummary: !!reactData.cycle_summary,
        cycleSummaryLength: reactData.cycle_summary?.length,
      });
    }

    // Get agent-specific content
    let agentContent: JSX.Element;
    switch (agentType) {
      case 'assessment':
        agentContent = <AssessmentDetail data={data} />;
        break;
      case 'ec':
        agentContent = <ECDetail data={data} />;
        break;
      case 'gameplan':
        agentContent = <GamePlanDetail data={data} />;
        break;
      case 'execution':
        agentContent = <ExecutionDetail data={data} />;
        break;
      case 'awards':
        agentContent = <AwardsDetail data={data} />;
        break;
      case 'opportunity':
        agentContent = <OpportunityDetail data={data} />;
        break;
      case 'crisis':
        agentContent = <CrisisDetail data={data} />;
        break;
      default:
        agentContent = <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
    }

    return (
      <div className="space-y-6">
        {/* Agent-specific content */}
        {agentContent}

        {/* ReAct Visualization - Show when agent has _react data */}
        {hasReactData && (
          <ReActVisualization
            agentName={getAgentDisplayName(agentType)}
            reactData={reactData}
          />
        )}
      </div>
    );
  };

  // Helper to get display name for agent
  const getAgentDisplayName = (type: AgentType): string => {
    const names: Record<AgentType, string> = {
      assessment: 'Assessment Agent',
      ec: 'Extracurriculars Agent',
      gameplan: 'GamePlan Orchestrator',
      execution: 'Execution Agent',
      awards: 'Awards Agent',
      opportunity: 'Programs Agent',
      crisis: 'Crisis Agent',
    };
    return names[type] || type;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: BRAND_COLORS.borderLight }}
        >
          <h2
            className="text-xl font-bold"
            style={{ color: BRAND_COLORS.textHeading }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} style={{ color: BRAND_COLORS.textMuted }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ASSESSMENT DETAIL VIEW
// ============================================================
function AssessmentDetail({ data }: { data: Record<string, unknown> }) {
  // v5.2: Support both camelCase (from AssessmentAgentCard) and snake_case field names
  const dna = data.narrativeDna as string || data.dna as string || data.narrative_dna as string || '';
  const themes = (data.themes as string[]) || (data.narrativeThemes as string[]) || [];
  const confidence = (data.confidence as number) || (data.narrativeConfidence as number) || (data.confidence_score as number) || 0;
  const identityMarkers = (data.identity_markers as string[]) || [];
  const brandStatement = data.brandStatement as string || data.brand_statement as string || data.rationale as string || '';

  return (
    <div className="space-y-6">
      {/* Narrative DNA */}
      <Section title="Narrative DNA" icon={<Brain size={20} />}>
        <p className="text-base leading-relaxed" style={{ color: BRAND_COLORS.textPrimary }}>
          {dna || 'No narrative generated yet'}
        </p>
      </Section>

      {/* Brand Statement */}
      {brandStatement && (
        <Section title="Brand Statement" icon={<Zap size={20} />}>
          <p className="text-base italic" style={{ color: BRAND_COLORS.secondary }}>
            "{brandStatement}"
          </p>
        </Section>
      )}

      {/* Themes */}
      {themes.length > 0 && (
        <Section title="Key Themes" icon={<Target size={20} />}>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-sm"
                style={{
                  backgroundColor: BRAND_COLORS.primaryBg,
                  color: BRAND_COLORS.primary,
                }}
              >
                {theme}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Identity Markers */}
      {identityMarkers.length > 0 && (
        <Section title="Identity Markers" icon={<CheckCircle2 size={20} />}>
          <ul className="space-y-2">
            {identityMarkers.map((marker, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 size={16} style={{ color: BRAND_COLORS.success }} className="mt-0.5" />
                <span style={{ color: BRAND_COLORS.textPrimary }}>{marker}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Confidence Score */}
      <Section title="Confidence Score" icon={<TrendingUp size={20} />}>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 rounded-full bg-gray-200">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${confidence * 100}%`,
                backgroundColor:
                  confidence >= 0.8
                    ? BRAND_COLORS.success
                    : confidence >= 0.6
                    ? BRAND_COLORS.warning
                    : BRAND_COLORS.error,
              }}
            />
          </div>
          <span className="text-lg font-bold" style={{ color: BRAND_COLORS.textHeading }}>
            {Math.round(confidence * 100)}%
          </span>
        </div>
      </Section>
    </div>
  );
}

// ============================================================
// EC AGENT DETAIL VIEW - Activities/Extracurriculars
// Enhanced with 4 Pillars + 10 Dimensions (v5.0)
// ============================================================
function ECDetail({ data }: { data: Record<string, unknown> }) {
  // v5.0: Extract EC Generation Engine data from nested structure
  // Data can be at: data.ec_generation, data.identity_synthesis, or top level
  const ecGeneration = (data.ec_generation as Record<string, unknown>) || {};
  const identitySynthesis = (data.identity_synthesis as Record<string, unknown>) || {};

  // Extract activities - prefer recommended_activities from EC Engine (signature projects, etc.)
  const ecEngineActivities = (ecGeneration.recommended_activities as GeneratedActivity[]) || [];
  const fallbackActivities = (data.activities as Array<{name?: string; type?: string; category?: string; description?: string}>) || [];

  // Filter out awards and programs from fallback activities (those come from other agents)
  const filteredActivities = fallbackActivities.filter(a => {
    const category = (a.category || a.type || '').toLowerCase();
    return !['award', 'program', 'awards', 'programs'].includes(category);
  });

  const seeds = (data.identity_seeds as Array<{name?: string; type?: string; description?: string; planted?: boolean}>) || [];
  const categories = (data.categories as Record<string, unknown[]>) || {};
  const totalActivities = (data.total_activities as number) || ecEngineActivities.length || filteredActivities.length;
  const plantedSeeds = (data.planted_seeds as number) || seeds.filter(s => s.planted).length;

  // v5.0: Extract EC Generation Engine data from nested locations
  const fourPillars = (
    data.four_pillars ||
    ecGeneration.four_pillars ||
    identitySynthesis.four_pillars
  ) as FourPillarsData | undefined;

  const tenDimensions = (
    data.ten_dimensions ||
    ecGeneration.ten_dimensions
  ) as TenDimensionsData | undefined;

  // Use EC Engine generated activities (signature projects, leadership, research, etc.)
  const generatedActivities = ecEngineActivities.length > 0 ? ecEngineActivities : undefined;

  // Spike and archetype can be at multiple levels
  const spike = (
    data.spike ||
    identitySynthesis.spike ||
    ecGeneration.spike
  ) as string | undefined;

  const archetype = (
    data.archetype ||
    identitySynthesis.archetype ||
    ecGeneration.archetype
  ) as string | undefined;

  const onlyTheyPassed = (
    data.only_they_passed ||
    ecGeneration.only_they_passed
  ) as boolean | undefined;

  // Check if we have EC Engine data
  const hasECEngineData = fourPillars || tenDimensions || generatedActivities;

  return (
    <div className="space-y-6">
      {/* v5.0: Spike & Archetype Header (if available) */}
      {(spike || archetype) && (
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: BRAND_COLORS.primaryBg,
            border: `1px solid ${BRAND_COLORS.primary}40`,
          }}
        >
          {spike && (
            <div className="mb-3">
              <p className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.primary }}>
                Identity Spike
              </p>
              <p className="text-base font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                {spike}
              </p>
            </div>
          )}
          {archetype && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.textMuted }}>
                  Archetype
                </p>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: BRAND_COLORS.secondary, color: 'white' }}
                >
                  {archetype}
                </span>
              </div>
              {onlyTheyPassed !== undefined && (
                <div className="text-right">
                  <p className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.textMuted }}>
                    "Only They" Test
                  </p>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: onlyTheyPassed ? BRAND_COLORS.success : BRAND_COLORS.error,
                      color: 'white',
                    }}
                  >
                    {onlyTheyPassed ? 'Passed' : 'Needs Work'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* v5.0: 4 Pillars Grid (if available) */}
      {fourPillars && (
        <ExpandableSection
          title="4 Pillars Analysis"
          icon={<Target size={20} />}
          defaultExpanded={true}
          itemCount={4}
        >
          <FourPillarsGrid data={fourPillars} />
        </ExpandableSection>
      )}

      {/* v5.0: 10 Dimensions Accordion (if available) */}
      {tenDimensions && (
        <ExpandableSection
          title="10 Dimensions of Hyper-Personalization"
          icon={<Lightbulb size={20} />}
          defaultExpanded={false}
          itemCount={tenDimensions.dimensions_met}
        >
          <TenDimensionsAccordion data={tenDimensions} />
        </ExpandableSection>
      )}

      {/* v5.0: Generated Activities with full context (if available) */}
      {generatedActivities && generatedActivities.length > 0 && (
        <ExpandableSection
          title="Generated Activities"
          icon={<Zap size={20} />}
          defaultExpanded={true}
          itemCount={generatedActivities.length}
        >
          <div className="space-y-4">
            {generatedActivities.map((activity, i) => (
              <ActivityOutputCard
                key={i}
                activity={activity}
                index={i}
                showPillars={true}
                showDimensions={true}
                showReframe={true}
                showMetrics={true}
              />
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Summary Stats (always show) */}
      <Section title="Activity Summary" icon={<Target size={20} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Activities" value={totalActivities} />
          <StatCard label="Categories" value={Object.keys(categories).length} />
          <StatCard label="Seeds Planted" value={plantedSeeds} />
          <StatCard label="Opportunities" value={seeds.filter(s => !s.planted).length} />
        </div>
      </Section>

      {/* Activity Categories */}
      {Object.keys(categories).length > 0 && (
        <Section title="Activity Categories" icon={<Lightbulb size={20} />}>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(categories).map(([category, items]) => (
              <div
                key={category}
                className="p-4 rounded-lg"
                style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h4>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: BRAND_COLORS.primaryBg,
                      color: BRAND_COLORS.primary,
                    }}
                  >
                    {(items as unknown[]).length} activities
                  </span>
                </div>
                <ul className="space-y-1">
                  {(items as Array<{name?: string}>).slice(0, 3).map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: BRAND_COLORS.textPrimary }}>
                      <CheckCircle2 size={14} style={{ color: BRAND_COLORS.success }} className="mt-0.5" />
                      {item.name || 'Activity'}
                    </li>
                  ))}
                  {(items as unknown[]).length > 3 && (
                    <li className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                      +{(items as unknown[]).length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* All Activities (excluding awards/programs which are handled by their agents) */}
      {filteredActivities.length > 0 && (
        <Section title="Recommended Activities" icon={<TrendingUp size={20} />}>
          <div className="space-y-3">
            {filteredActivities.map((activity, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border"
                style={{ borderColor: BRAND_COLORS.borderLight }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                      {activity.name || `Activity ${i + 1}`}
                    </h4>
                    {activity.description && (
                      <p className="text-sm mt-1" style={{ color: BRAND_COLORS.textMuted }}>
                        {activity.description}
                      </p>
                    )}
                  </div>
                  {(activity.type || activity.category) && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        backgroundColor: BRAND_COLORS.primaryBg,
                        color: BRAND_COLORS.primary,
                      }}
                    >
                      {activity.type || activity.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Identity Seeds */}
      {seeds.length > 0 && (
        <Section title="Identity Seeds" icon={<Zap size={20} />}>
          <div className="space-y-3">
            {seeds.map((seed, i) => (
              <div
                key={i}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: seed.planted ? BRAND_COLORS.bgSuccess : BRAND_COLORS.bgWarning,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                      {seed.name || `Seed ${i + 1}`}
                    </h4>
                    {seed.description && (
                      <p className="text-sm mt-1" style={{ color: BRAND_COLORS.textMuted }}>
                        {seed.description}
                      </p>
                    )}
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: seed.planted ? BRAND_COLORS.success : BRAND_COLORS.warning,
                      color: 'white',
                    }}
                  >
                    {seed.planted ? 'Planted' : 'Opportunity'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// ============================================================
// GAME PLAN DETAIL VIEW
// ============================================================
function GamePlanDetail({ data }: { data: Record<string, unknown> }) {
  const gamePlan = (data.game_plan as Record<string, unknown>) || data;
  const activities = (gamePlan.activities as Record<string, unknown>[]) || [];
  const seeds = (gamePlan.identity_seeds as Record<string, unknown>[]) || [];
  const phases = (gamePlan.phases as Record<string, unknown>[]) || [];
  const narrativeDna = gamePlan.narrative_dna as string || '';
  const summary = (gamePlan.summary as Record<string, unknown>) || {};

  // Get awards and programs from game plan
  const awards = gamePlan.awards as Record<string, unknown> | undefined;
  const programs = gamePlan.programs as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Activities" value={activities.length} />
        <StatCard label="Identity Seeds" value={seeds.length} />
        <StatCard label="Awards Matched" value={(summary.total_awards_matched as number) || 0} />
        <StatCard label="Programs Matched" value={(summary.total_programs_matched as number) || 0} />
      </div>

      {/* Narrative DNA - Clickable */}
      {narrativeDna && (
        <ExpandableSection
          title="Guiding Narrative"
          icon={<Brain size={20} />}
          defaultExpanded={true}
          preview={
            <p className="text-sm line-clamp-2" style={{ color: BRAND_COLORS.textMuted }}>
              {narrativeDna.slice(0, 150)}...
            </p>
          }
        >
          <p className="text-sm leading-relaxed" style={{ color: BRAND_COLORS.textPrimary }}>
            {narrativeDna}
          </p>
        </ExpandableSection>
      )}

      {/* Strategic Phases - Clickable */}
      {phases.length > 0 && (
        <ExpandableSection
          title="Strategic Phases"
          icon={<Calendar size={20} />}
          itemCount={phases.length}
          defaultExpanded={false}
          preview={
            <div className="flex flex-wrap gap-2">
              {phases.slice(0, 3).map((phase, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{ backgroundColor: BRAND_COLORS.primaryBg, color: BRAND_COLORS.primary }}
                >
                  {(phase.name as string) || `Phase ${i + 1}`}
                </span>
              ))}
              {phases.length > 3 && (
                <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                  +{phases.length - 3} more
                </span>
              )}
            </div>
          }
        >
          <div className="space-y-3">
            {phases.map((phase, i) => (
              <div
                key={i}
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.borderLight}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                    {(phase.name as string) || `Phase ${i + 1}`}
                  </h4>
                  <span className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                    {phase.duration as string}
                  </span>
                </div>
                <p className="text-sm" style={{ color: BRAND_COLORS.textPrimary }}>
                  {phase.focus as string}
                </p>
                <div className="mt-2 text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                  {(phase.activity_count as number) || 0} activities
                </div>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Activities - Clickable */}
      {activities.length > 0 && (
        <ExpandableSection
          title="Activities"
          icon={<CheckCircle2 size={20} />}
          itemCount={activities.length}
          defaultExpanded={false}
          preview={
            <div className="flex flex-wrap gap-2">
              {activities.slice(0, 4).map((act, i) => {
                const isECActivity = act.source === 'ec_engine' || act.category === 'ec_activity';
                return (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: isECActivity ? BRAND_COLORS.bgSuccess : BRAND_COLORS.bgWarning,
                      color: isECActivity ? BRAND_COLORS.success : BRAND_COLORS.warning,
                    }}
                  >
                    {(act.name as string) || (act.activity_name as string) || `Activity ${i + 1}`}
                  </span>
                );
              })}
              {activities.length > 4 && (
                <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                  +{activities.length - 4} more
                </span>
              )}
            </div>
          }
        >
          <div className="space-y-2">
            {activities.map((act, i) => {
              // Determine if this is an EC Engine activity
              const isECActivity = act.source === 'ec_engine' || act.category === 'ec_activity';
              const isAward = (act.type as string)?.toLowerCase() === 'award';
              const isProgram = (act.type as string)?.toLowerCase() === 'program';

              // Format activity type label
              const typeLabel = (() => {
                const type = (act.type as string) || '';
                if (type === 'activity_count') return 'Core Activity';
                if (type === 'signature_project') return 'Signature Project';
                if (type === 'leadership') return 'Leadership';
                if (type === 'research') return 'Research';
                if (type === 'community_service') return 'Community Service';
                return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              })();

              // Style based on activity type
              const typeBgColor = isECActivity ? BRAND_COLORS.bgSuccess : (isAward ? BRAND_COLORS.bgWarning : BRAND_COLORS.primaryBg);
              const typeTextColor = isECActivity ? BRAND_COLORS.success : (isAward ? BRAND_COLORS.warning : BRAND_COLORS.primary);
              const borderColor = isECActivity ? BRAND_COLORS.success : BRAND_COLORS.borderLight;

              return (
                <div
                  key={i}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: 'white',
                    border: `1px solid ${borderColor}`,
                    borderLeft: isECActivity ? `3px solid ${BRAND_COLORS.success}` : undefined,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm" style={{ color: BRAND_COLORS.textHeading }}>
                        {(act.name as string) || (act.activity_name as string) || `Activity ${i + 1}`}
                      </h4>
                      {isECActivity && (
                        <span className="text-xs font-medium" style={{ color: BRAND_COLORS.success }}>
                          EC Engine Generated
                        </span>
                      )}
                    </div>
                    {typeLabel && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{ backgroundColor: typeBgColor, color: typeTextColor }}
                      >
                        {typeLabel}
                      </span>
                    )}
                  </div>
                  {typeof act.description === 'string' && act.description && (
                    <p className="text-sm mt-1" style={{ color: BRAND_COLORS.textMuted }}>
                      {act.description.slice(0, 150)}...
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </ExpandableSection>
      )}

      {/* Identity Seeds - Clickable */}
      {seeds.length > 0 && (
        <ExpandableSection
          title="Identity Seeds"
          icon={<Lightbulb size={20} />}
          itemCount={seeds.length}
          defaultExpanded={false}
          preview={
            <div className="flex flex-wrap gap-2">
              {seeds.slice(0, 3).map((seed, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{ backgroundColor: BRAND_COLORS.bgWarning, color: BRAND_COLORS.warning }}
                >
                  {(seed.target as string) || (seed.name as string) || `Seed ${i + 1}`}
                </span>
              ))}
              {seeds.length > 3 && (
                <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                  +{seeds.length - 3} more
                </span>
              )}
            </div>
          }
        >
          <div className="space-y-4">
            {seeds.map((seed, i) => (
              <div
                key={i}
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.borderLight}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                    {(seed.target as string) || (seed.name as string) || `Seed ${i + 1}`}
                  </h4>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: BRAND_COLORS.primaryBg,
                      color: BRAND_COLORS.primary,
                    }}
                  >
                    {(seed.target_type as string) || (seed.type as string) || 'Identity'}
                  </span>
                </div>
                {typeof seed.narrative_connection === 'string' && seed.narrative_connection && (
                  <p className="text-sm mb-3" style={{ color: BRAND_COLORS.textMuted }}>
                    {seed.narrative_connection.slice(0, 200)}...
                  </p>
                )}
                {/* Actions */}
                {(seed.actions as Record<string, unknown>[])?.slice(0, 3).map((action, j) => (
                  <div key={j} className="flex items-start gap-2 mt-2 text-sm">
                    <CheckCircle2 size={14} style={{ color: BRAND_COLORS.success }} className="mt-0.5" />
                    <span style={{ color: BRAND_COLORS.textPrimary }}>{action.action as string}</span>
                  </div>
                ))}
                {((seed.actions as unknown[])?.length || 0) > 3 && (
                  <p className="text-xs mt-2" style={{ color: BRAND_COLORS.textMuted }}>
                    +{((seed.actions as unknown[]).length - 3)} more actions
                  </p>
                )}
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Awards Portfolio Summary - Clickable */}
      {awards && (
        <ExpandableSection
          title="Awards Portfolio"
          icon={<Award size={20} />}
          itemCount={(summary.total_awards_matched as number) || 0}
          defaultExpanded={false}
          preview={
            <div className="flex gap-4">
              <span className="text-sm" style={{ color: BRAND_COLORS.primary }}>
                Reach: {((awards.portfolio as Record<string, unknown[]>)?.reach?.length || 0)}
              </span>
              <span className="text-sm" style={{ color: BRAND_COLORS.warning }}>
                Target: {((awards.portfolio as Record<string, unknown[]>)?.target?.length || 0)}
              </span>
              <span className="text-sm" style={{ color: BRAND_COLORS.success }}>
                Safety: {((awards.portfolio as Record<string, unknown[]>)?.safety?.length || 0)}
              </span>
            </div>
          }
        >
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: BRAND_COLORS.primaryBg }}>
              <p className="text-xl font-bold" style={{ color: BRAND_COLORS.primary }}>
                {((awards.portfolio as Record<string, unknown[]>)?.reach?.length || 0)}
              </p>
              <p className="text-xs" style={{ color: BRAND_COLORS.primary }}>Reach</p>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: BRAND_COLORS.bgWarning }}>
              <p className="text-xl font-bold" style={{ color: BRAND_COLORS.warning }}>
                {((awards.portfolio as Record<string, unknown[]>)?.target?.length || 0)}
              </p>
              <p className="text-xs" style={{ color: BRAND_COLORS.warning }}>Target</p>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: BRAND_COLORS.bgSuccess }}>
              <p className="text-xl font-bold" style={{ color: BRAND_COLORS.success }}>
                {((awards.portfolio as Record<string, unknown[]>)?.safety?.length || 0)}
              </p>
              <p className="text-xs" style={{ color: BRAND_COLORS.success }}>Safety</p>
            </div>
          </div>
          {/* Show actual awards from portfolio */}
          {((awards.portfolio as Record<string, unknown[]>)?.reach?.length || 0) > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.primary }}>Reach Awards</p>
              <div className="space-y-1">
                {((awards.portfolio as Record<string, unknown[]>)?.reach || []).slice(0, 3).map((award, i) => {
                  const a = award as Record<string, unknown>;
                  return (
                    <div key={i} className="p-2 rounded text-sm" style={{ backgroundColor: `${BRAND_COLORS.primaryBg}40` }}>
                      <span style={{ color: BRAND_COLORS.textHeading }}>{a.name as string || `Award ${i + 1}`}</span>
                      {a.fit_score !== undefined && (
                        <span className="ml-2 text-xs" style={{ color: BRAND_COLORS.primary }}>
                          {Math.round((a.fit_score as number) * 100)}% fit
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {((awards.portfolio as Record<string, unknown[]>)?.target?.length || 0) > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.warning }}>Target Awards</p>
              <div className="space-y-1">
                {((awards.portfolio as Record<string, unknown[]>)?.target || []).slice(0, 3).map((award, i) => {
                  const a = award as Record<string, unknown>;
                  return (
                    <div key={i} className="p-2 rounded text-sm" style={{ backgroundColor: `${BRAND_COLORS.bgWarning}40` }}>
                      <span style={{ color: BRAND_COLORS.textHeading }}>{a.name as string || `Award ${i + 1}`}</span>
                      {a.fit_score !== undefined && (
                        <span className="ml-2 text-xs" style={{ color: BRAND_COLORS.warning }}>
                          {Math.round((a.fit_score as number) * 100)}% fit
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {((awards.portfolio as Record<string, unknown[]>)?.safety?.length || 0) > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.success }}>Safety Awards</p>
              <div className="space-y-1">
                {((awards.portfolio as Record<string, unknown[]>)?.safety || []).slice(0, 3).map((award, i) => {
                  const a = award as Record<string, unknown>;
                  return (
                    <div key={i} className="p-2 rounded text-sm" style={{ backgroundColor: `${BRAND_COLORS.bgSuccess}40` }}>
                      <span style={{ color: BRAND_COLORS.textHeading }}>{a.name as string || `Award ${i + 1}`}</span>
                      {a.fit_score !== undefined && (
                        <span className="ml-2 text-xs" style={{ color: BRAND_COLORS.success }}>
                          {Math.round((a.fit_score as number) * 100)}% fit
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {Array.isArray(awards.strategic_insights) && (awards.strategic_insights as unknown[]).length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.textMuted }}>Strategic Insights</p>
              <ul className="space-y-1">
                {(awards.strategic_insights as unknown[]).slice(0, 3).map((insight, i) => {
                  const text = typeof insight === 'string'
                    ? insight
                    : (insight as {message?: string; title?: string}).message || (insight as {message?: string; title?: string}).title || '';
                  return (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
                      <span style={{ color: BRAND_COLORS.primary }}>•</span>
                      {text}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </ExpandableSection>
      )}

      {/* Programs Summary - Clickable */}
      {/* NOTE: Programs does NOT have reach/target/safety portfolio, just top_recommendations */}
      {programs && (
        <ExpandableSection
          title="Programs Matched"
          icon={<GraduationCap size={20} />}
          itemCount={(summary.total_programs_matched as number) || 0}
          defaultExpanded={false}
          preview={
            <div className="flex flex-wrap gap-2">
              {((programs.top_recommendations as Record<string, unknown>[]) || []).slice(0, 3).map((prog, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{ backgroundColor: BRAND_COLORS.primaryBg, color: BRAND_COLORS.primary }}
                >
                  {(prog.name as string) || `Program ${i + 1}`}
                </span>
              ))}
              {((programs.top_recommendations as unknown[]) || []).length > 3 && (
                <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                  +{((programs.top_recommendations as unknown[]).length - 3)} more
                </span>
              )}
            </div>
          }
        >
          <div className="space-y-2">
            {((programs.top_recommendations as Record<string, unknown>[]) || []).map((prog, i) => (
              <div
                key={i}
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'white', border: `1px solid ${BRAND_COLORS.borderLight}` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-sm" style={{ color: BRAND_COLORS.textHeading }}>
                      {(prog.name as string) || `Program ${i + 1}`}
                    </h4>
                    {typeof prog.organization === 'string' && prog.organization && (
                      <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                        {prog.organization}
                      </span>
                    )}
                  </div>
                  {prog.fit_score !== undefined && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: BRAND_COLORS.bgSuccess, color: BRAND_COLORS.success }}
                    >
                      {Math.round((prog.fit_score as number) * 100)}% fit
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {Array.isArray(programs.strategic_insights) && (programs.strategic_insights as unknown[]).length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.textMuted }}>Strategic Insights</p>
              <ul className="space-y-1">
                {(programs.strategic_insights as unknown[]).slice(0, 3).map((insight, i) => {
                  const text = typeof insight === 'string'
                    ? insight
                    : (insight as {message?: string; title?: string}).message || (insight as {message?: string; title?: string}).title || '';
                  return (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
                      <span style={{ color: BRAND_COLORS.primary }}>•</span>
                      {text}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </ExpandableSection>
      )}
    </div>
  );
}

// ============================================================
// EXECUTION DETAIL VIEW
// ============================================================
function ExecutionDetail({ data }: { data: Record<string, unknown> }) {
  const eds = (data.eds as number) || 0;
  const blockers = (data.blockers as Record<string, unknown>[]) || [];
  const debtLevel = data.debt_level as string || 'Unknown';

  return (
    <div className="space-y-6">
      {/* EDS Score */}
      <Section title="Execution Debt Score" icon={<Zap size={20} />}>
        <div className="flex items-center gap-6">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: eds < 25 ? BRAND_COLORS.bgSuccess : eds < 50 ? BRAND_COLORS.warningBg : BRAND_COLORS.errorBg,
            }}
          >
            <span className="text-4xl font-bold" style={{ color: BRAND_COLORS.textHeading }}>
              {eds}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
              {eds < 25 ? 'Excellent' : eds < 50 ? 'Good' : eds < 75 ? 'Needs Attention' : 'Critical'}
            </p>
            <p style={{ color: BRAND_COLORS.textMuted }}>
              {eds < 25
                ? 'You are on track with your execution'
                : eds < 50
                ? 'Some tasks need attention'
                : 'Multiple blockers affecting progress'}
            </p>
          </div>
        </div>
      </Section>

      {/* Blockers */}
      {blockers.length > 0 && (
        <Section title="Active Blockers" icon={<AlertTriangle size={20} />}>
          <div className="space-y-3">
            {blockers.map((blocker, i) => (
              <div
                key={i}
                className="p-4 rounded-lg"
                style={{ backgroundColor: BRAND_COLORS.errorBg }}
              >
                <h4 className="font-semibold" style={{ color: BRAND_COLORS.error }}>
                  {blocker.title as string}
                </h4>
                <p className="text-sm mt-1" style={{ color: BRAND_COLORS.textPrimary }}>
                  {blocker.description as string}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {blockers.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle2 size={48} style={{ color: BRAND_COLORS.success }} className="mx-auto mb-3" />
          <p className="text-lg font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
            No Active Blockers
          </p>
          <p style={{ color: BRAND_COLORS.textMuted }}>
            Your execution is proceeding smoothly
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// AWARDS DETAIL VIEW - Updated for reach/target/safety
// ============================================================
function AwardsDetail({ data }: { data: Record<string, unknown> }) {
  const portfolio = (data.portfolio as Record<string, unknown>) || {};
  const totalMatched = (data.total_matched as number) || 0;
  const topRecommendations = (data.top_recommendations as Record<string, unknown>[]) || [];
  const strategicInsights = (data.strategic_insights as unknown[]) || [];

  // Get awards from portfolio tiers - support both new (reach/target/safety) and old (likely/target/stretch)
  const reachAwards = (portfolio.reach as Record<string, unknown>[]) || (portfolio.likely as Record<string, unknown>[]) || [];
  const targetAwards = (portfolio.target as Record<string, unknown>[]) || [];
  const safetyAwards = (portfolio.safety as Record<string, unknown>[]) || (portfolio.stretch as Record<string, unknown>[]) || [];

  // Render an award item
  const renderAwardItem = (award: Record<string, unknown>, tierColor: string, tierBg: string, index: number) => {
    return (
      <div
        key={`${award.name as string || award.id as string || index}`}
        className="p-3 rounded-lg border"
        style={{ borderColor: BRAND_COLORS.borderLight, backgroundColor: tierBg }}
      >
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-sm" style={{ color: BRAND_COLORS.textHeading }}>
            {award.name as string || 'Unknown Award'}
          </h4>
          {award.fit_score !== undefined && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: tierColor, color: '#fff' }}>
              {Math.round((award.fit_score as number) * 100)}% fit
            </span>
          )}
        </div>
        {/* Organization */}
        {typeof award.organization === 'string' && award.organization && (
          <p className="text-xs mb-1" style={{ color: BRAND_COLORS.textMuted }}>
            {award.organization}
          </p>
        )}
        {/* Description */}
        {typeof award.description === 'string' && award.description && (
          <p className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>
            {award.description.slice(0, 100)}...
          </p>
        )}
        {/* Metadata row */}
        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: BRAND_COLORS.textMuted }}>
          {award.selectivity !== undefined && (
            <span>{Math.round((award.selectivity as number) * 100)}% selectivity</span>
          )}
          {typeof award.deadline === 'string' && award.deadline && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {award.deadline}
            </span>
          )}
        </div>
      </div>
    );
  };

  const hasAwards = reachAwards.length > 0 || targetAwards.length > 0 || safetyAwards.length > 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Section title="Awards Portfolio" icon={<Award size={20} />}>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.primaryBg }}>
            <p className="text-3xl font-bold" style={{ color: BRAND_COLORS.primary }}>{reachAwards.length}</p>
            <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Reach</p>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.bgWarning }}>
            <p className="text-3xl font-bold" style={{ color: BRAND_COLORS.warning }}>{targetAwards.length}</p>
            <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Target</p>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.bgSuccess }}>
            <p className="text-3xl font-bold" style={{ color: BRAND_COLORS.success }}>{safetyAwards.length}</p>
            <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Safety</p>
          </div>
        </div>
        {totalMatched > 0 && (
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: BRAND_COLORS.bgSecondary }}>
            <span style={{ color: BRAND_COLORS.textMuted }}>Total Matched: </span>
            <span className="font-bold" style={{ color: BRAND_COLORS.success }}>{totalMatched}</span>
          </div>
        )}
      </Section>

      {/* Reach Awards */}
      {reachAwards.length > 0 && (
        <Section title="Reach Awards (Ambitious)" icon={<TrendingUp size={20} style={{ color: BRAND_COLORS.primary }} />}>
          <div className="space-y-2">
            {reachAwards.map((award, i) => renderAwardItem(award, BRAND_COLORS.primary, `${BRAND_COLORS.primaryBg}40`, i))}
          </div>
        </Section>
      )}

      {/* Target Awards */}
      {targetAwards.length > 0 && (
        <Section title="Target Awards (Competitive)" icon={<Target size={20} style={{ color: BRAND_COLORS.warning }} />}>
          <div className="space-y-2">
            {targetAwards.map((award, i) => renderAwardItem(award, BRAND_COLORS.warning, `${BRAND_COLORS.bgWarning}40`, i))}
          </div>
        </Section>
      )}

      {/* Safety Awards */}
      {safetyAwards.length > 0 && (
        <Section title="Safety Awards (High Probability)" icon={<CheckCircle2 size={20} style={{ color: BRAND_COLORS.success }} />}>
          <div className="space-y-2">
            {safetyAwards.map((award, i) => renderAwardItem(award, BRAND_COLORS.success, `${BRAND_COLORS.bgSuccess}40`, i))}
          </div>
        </Section>
      )}

      {/* Strategic Insights */}
      {strategicInsights.length > 0 && (
        <Section title="Strategic Insights" icon={<Brain size={20} />}>
          <ul className="space-y-2">
            {strategicInsights.map((insight, i) => {
              const text = typeof insight === 'string'
                ? insight
                : (insight as {message?: string; title?: string}).message || (insight as {message?: string; title?: string}).title || '';
              return (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
                  <span style={{ color: BRAND_COLORS.primary }}>•</span>
                  {text}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {/* Fallback: No awards message */}
      {!hasAwards && (
        <div className="text-center py-8">
          <Award size={48} style={{ color: BRAND_COLORS.textMuted }} className="mx-auto mb-3" />
          <p className="text-lg font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
            Loading Awards Portfolio
          </p>
          <p style={{ color: BRAND_COLORS.textMuted }}>
            Refresh to see your matched awards
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// OPPORTUNITY/PROGRAMS DETAIL VIEW
// NOTE: Programs Agent does NOT have reach/target/safety portfolio
// It returns: top_recommendations, advance_alerts, synergy_recommendations, strategic_insights
// ============================================================
function OpportunityDetail({ data }: { data: Record<string, unknown> }) {
  // Programs data - no portfolio structure, just recommendations
  const programs = (data.programs as Record<string, unknown>[]) || (data.top_recommendations as Record<string, unknown>[]) || [];
  const advanceAlerts = (data.advance_alerts as Record<string, unknown>[]) || [];
  const synergyRecommendations = (data.synergy_recommendations as Record<string, unknown>[]) || [];
  const alerts = (data.alerts as Record<string, unknown>[]) || [];
  const urgentCount = (data.urgent_count as number) || 0;
  const totalMatched = (data.total_matched as number) || programs.length;
  const strategicInsights = (data.strategic_insights as unknown[]) || [];

  const hasPrograms = programs.length > 0;

  // Helper to render a program item
  const renderProgramItem = (program: Record<string, unknown>, accentColor: string, bgColor: string, index: number) => (
    <div
      key={index}
      className="p-4 rounded-lg border"
      style={{ borderColor: accentColor, backgroundColor: bgColor }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
            {program.name as string || program.program_name as string || 'Program'}
          </h4>
          <p className="text-sm mt-1" style={{ color: BRAND_COLORS.textMuted }}>
            {program.organization as string || program.type as string || ''}
          </p>
        </div>
        {program.fit_score !== undefined && (
          <span
            className="px-2 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: accentColor, color: 'white' }}
          >
            {Math.round((program.fit_score as number) * 100)}% fit
          </span>
        )}
      </div>
      {typeof program.description === 'string' && program.description && (
        <p className="text-sm mt-2" style={{ color: BRAND_COLORS.textSecondary }}>
          {program.description}
        </p>
      )}
      {typeof program.deadline === 'string' && program.deadline && (
        <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: BRAND_COLORS.warning }}>
          <Clock size={12} />
          Deadline: {program.deadline}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-lg text-center" style={{ backgroundColor: BRAND_COLORS.bgSecondary }}>
          <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.success }}>{totalMatched}</p>
          <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Total Matched</p>
        </div>
        <div className="p-4 rounded-lg text-center" style={{ backgroundColor: BRAND_COLORS.primaryBg }}>
          <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>{programs.length}</p>
          <p className="text-xs" style={{ color: BRAND_COLORS.primary }}>Top Programs</p>
        </div>
      </div>

      {/* Urgent Deadline Alerts */}
      {urgentCount > 0 && alerts.length > 0 && (
        <Section title="Urgent Deadlines" icon={<AlertTriangle size={20} />}>
          <div className="space-y-3">
            {alerts.filter(a => a.urgency === 'URGENT' || a.urgent).slice(0, 3).map((alert, i) => (
              <div
                key={i}
                className="p-4 rounded-lg"
                style={{ backgroundColor: BRAND_COLORS.bgError }}
              >
                <h4 className="font-semibold" style={{ color: BRAND_COLORS.error }}>
                  {alert.opportunity_name as string || alert.title as string}
                </h4>
                <p className="text-sm mt-1" style={{ color: BRAND_COLORS.textPrimary }}>
                  {alert.message as string || `${alert.months_remaining} months remaining`}
                </p>
                {typeof alert.deadline === 'string' && alert.deadline && (
                  <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: BRAND_COLORS.error }}>
                    <Clock size={12} />
                    Due: {alert.deadline}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Top Program Recommendations */}
      {hasPrograms && (
        <Section title={`Top Program Matches (${programs.length})`} icon={<GraduationCap size={20} />}>
          <div className="space-y-2">
            {programs.map((prog, i) => renderProgramItem(prog, BRAND_COLORS.primary, BRAND_COLORS.bgSecondary, i))}
          </div>
        </Section>
      )}

      {/* Synergy Recommendations */}
      {synergyRecommendations.length > 0 && (
        <Section title="Synergy Recommendations" icon={<Lightbulb size={20} />}>
          <div className="space-y-2">
            {synergyRecommendations.map((rec, i) => {
              const r = rec as Record<string, unknown>;
              return (
                <div
                  key={i}
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: BRAND_COLORS.bgSecondary, border: `1px solid ${BRAND_COLORS.borderLight}` }}
                >
                  <p className="text-sm font-medium" style={{ color: BRAND_COLORS.textHeading }}>
                    {r.recommendation as string || r.title as string || 'Recommendation'}
                  </p>
                  {typeof r.rationale === 'string' && r.rationale && (
                    <p className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
                      {r.rationale}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Strategic Insights */}
      {strategicInsights.length > 0 && (
        <Section title="Strategic Insights" icon={<Brain size={20} />}>
          <ul className="space-y-2">
            {strategicInsights.map((insight, i) => {
              const text = typeof insight === 'string'
                ? insight
                : (insight as {message?: string; title?: string}).message || (insight as {message?: string; title?: string}).title || '';
              return (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
                  <span style={{ color: BRAND_COLORS.primary }}>•</span>
                  {text}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {/* Fallback: No programs message */}
      {!hasPrograms && programs.length === 0 && (
        <div className="text-center py-8">
          <GraduationCap size={48} style={{ color: BRAND_COLORS.textMuted }} className="mx-auto mb-3" />
          <p className="text-lg font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
            Loading Program Matches
          </p>
          <p style={{ color: BRAND_COLORS.textMuted }}>
            Refresh to see your matched programs from game plan orchestration
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CRISIS DETAIL VIEW
// ============================================================
function CrisisDetail({ data }: { data: Record<string, unknown> }) {
  const activeCrises = (data.active_crises as Record<string, unknown>[]) || [];
  const resolvedCrises = (data.resolved_crises as Record<string, unknown>[]) || [];

  return (
    <div className="space-y-6">
      {/* Active Crises */}
      {activeCrises.length > 0 && (
        <Section title="Active Crises" icon={<AlertTriangle size={20} />}>
          <div className="space-y-3">
            {activeCrises.map((crisis, i) => (
              <div
                key={i}
                className="p-4 rounded-lg"
                style={{ backgroundColor: BRAND_COLORS.errorBg }}
              >
                <h4 className="font-semibold" style={{ color: BRAND_COLORS.error }}>
                  {crisis.type as string}
                </h4>
                <p className="text-sm mt-1" style={{ color: BRAND_COLORS.textPrimary }}>
                  {crisis.description as string}
                </p>
                {typeof crisis.varc_response === 'string' && crisis.varc_response && (
                  <div className="mt-3 p-3 rounded bg-white">
                    <p className="text-sm font-medium" style={{ color: BRAND_COLORS.textHeading }}>
                      VARC Response
                    </p>
                    <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                      {crisis.varc_response}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {activeCrises.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle2 size={48} style={{ color: BRAND_COLORS.success }} className="mx-auto mb-3" />
          <p className="text-lg font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
            No Active Crises
          </p>
          <p style={{ color: BRAND_COLORS.textMuted }}>
            Everything is on track. Report a crisis if you need support.
          </p>
        </div>
      )}

      {/* VARC Framework Info */}
      <Section title="VARC Framework" icon={<Brain size={20} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg text-center" style={{ backgroundColor: BRAND_COLORS.bgSecondary }}>
            <p className="font-bold" style={{ color: BRAND_COLORS.primary }}>V</p>
            <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Validate</p>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ backgroundColor: BRAND_COLORS.bgSecondary }}>
            <p className="font-bold" style={{ color: BRAND_COLORS.primary }}>A</p>
            <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Act</p>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ backgroundColor: BRAND_COLORS.bgSecondary }}>
            <p className="font-bold" style={{ color: BRAND_COLORS.primary }}>R</p>
            <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Reframe</p>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ backgroundColor: BRAND_COLORS.bgSecondary }}>
            <p className="font-bold" style={{ color: BRAND_COLORS.primary }}>C</p>
            <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Create</p>
          </div>
        </div>
      </Section>
    </div>
  );
}

// ============================================================
// HELPER COMPONENTS
// ============================================================
function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: BRAND_COLORS.primary }}>{icon}</span>
        <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function ExpandableSection({
  title,
  icon,
  children,
  defaultExpanded = false,
  preview,
  itemCount
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  preview?: ReactNode;
  itemCount?: number;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: BRAND_COLORS.bgSecondary,
        border: `1px solid ${BRAND_COLORS.borderLight}`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:opacity-90 transition-opacity"
        style={{ backgroundColor: 'transparent' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: BRAND_COLORS.primary }}>{icon}</span>
          <h3 className="text-lg font-semibold text-left" style={{ color: BRAND_COLORS.textHeading }}>
            {title}
          </h3>
          {itemCount !== undefined && (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: BRAND_COLORS.primaryBg, color: BRAND_COLORS.primary }}
            >
              {itemCount}
            </span>
          )}
        </div>
        <span style={{ color: BRAND_COLORS.textMuted }}>
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </span>
      </button>
      {!expanded && preview && (
        <div className="px-4 pb-4 -mt-2">
          {preview}
        </div>
      )}
      {expanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-4 rounded-lg text-center" style={{ backgroundColor: BRAND_COLORS.bgSecondary }}>
      <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.textHeading }}>{value}</p>
      <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>{label}</p>
    </div>
  );
}

export default AgentDetailModal;
