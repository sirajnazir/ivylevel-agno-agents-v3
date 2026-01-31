// Multi-Agent Dashboard Tab
// File: components/dashboard/MultiAgentTab.tsx

'use client';

import React, { useState } from 'react';
import { Brain, Map, Zap, Award, RefreshCw, AlertCircle, CheckCircle, Loader2, ChevronRight, ChevronDown, Activity, Flame, User, Target, Sparkles, TreeDeciduous, Lightbulb, GraduationCap, MessageSquare } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { NarrativeDNACard } from '@/components/agents/NarrativeDNACard';
import {
  useAssessmentEnhancement,
  useFullAssessment,  // 🆕 V3: Full assessment with scoring primitives
  useGamePlan,
  useAwardMatches,
  useOpportunityMatches,
  useOpportunityAlerts,
  useExecutionDebtScore,
  useAgentHealth,
  useDashboardData,
} from '@/hooks/useAgentData';
import { useStudentStore } from '@/lib/store/useStudentStore';
import { useProfileIdentity } from '@/hooks/useProfileIdentity';

// v2.0 Components
import { TimeAuditCardV2 } from '@/components/agents/TimeAuditCardV2';
import { AwardsPortfolioCardV2 } from '@/components/agents/AwardsPortfolioCardV2';
import { CrisisAlchemyModal } from '@/components/agents/CrisisAlchemyModal';
import { useAgentV2Health } from '@/lib/hooks/useAgentV2';

// Detail Modal
import { AgentDetailModal, AgentType } from '@/components/agents/AgentDetailModal';

interface MultiAgentTabProps {
  profileId: string | null;
}

interface AgentCardProps {
  name: string;
  icon: React.ReactNode;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  onChat?: () => void;
  onClick?: () => void;
}

function AgentCard({ name, icon, status, error, children, onRefresh, onChat, onClick }: AgentCardProps) {
  const isClickable = !!onClick && status !== 'loading' && status !== 'error';

  return (
    <div
      className={`rounded-xl p-5 shadow-sm h-full flex flex-col transition-all ${
        isClickable ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''
      }`}
      style={{
        backgroundColor: '#ffffff',
        border: `1px solid ${BRAND_COLORS.borderLight}`,
      }}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: BRAND_COLORS.primaryBg }}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {status === 'loading' && (
                <span className="flex items-center gap-1 text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                  <Loader2 className="w-3 h-3 animate-spin" />Processing...
                </span>
              )}
              {status === 'success' && (
                <span className="flex items-center gap-1 text-xs" style={{ color: BRAND_COLORS.success }}>
                  <CheckCircle className="w-3 h-3" />Ready
                </span>
              )}
              {status === 'error' && (
                <span className="flex items-center gap-1 text-xs" style={{ color: BRAND_COLORS.error }}>
                  <AlertCircle className="w-3 h-3" />Error
                </span>
              )}
            </div>
          </div>
        </div>

        {status === 'loading' && (
          <RefreshCw
            size={16}
            className="animate-spin"
            style={{ color: BRAND_COLORS.textMuted }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-[120px]">
        {status === 'error' && error ? (
          <div className="flex flex-col items-center justify-center h-full py-4">
            <AlertCircle size={24} style={{ color: BRAND_COLORS.error }} className="mb-2" />
            <p style={{ color: BRAND_COLORS.error }} className="text-sm text-center">
              {error}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); onRefresh?.(); }}
              className="mt-3 text-sm underline"
              style={{ color: BRAND_COLORS.primary }}
            >
              Retry
            </button>
          </div>
        ) : status === 'loading' && !children ? (
          <div className="flex flex-col items-center justify-center h-full py-4">
            <RefreshCw
              size={24}
              className="animate-spin mb-2"
              style={{ color: BRAND_COLORS.textMuted }}
            />
            <p style={{ color: BRAND_COLORS.textMuted }} className="text-sm">
              Loading...
            </p>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-2 mt-4 pt-4 border-t"
        style={{ borderColor: BRAND_COLORS.borderLight }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onRefresh}
          disabled={status === 'loading'}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors hover:opacity-80 disabled:opacity-50"
          style={{
            backgroundColor: BRAND_COLORS.bgSecondary,
            color: BRAND_COLORS.textPrimary,
          }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>

        {onChat && (
          <button
            onClick={onChat}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors hover:opacity-80"
            style={{
              backgroundColor: BRAND_COLORS.primaryBg,
              color: BRAND_COLORS.primary,
            }}
          >
            <MessageSquare size={14} />
            Chat
          </button>
        )}

        {/* Click hint for clickable cards */}
        {isClickable && (
          <span className="ml-auto text-xs" style={{ color: BRAND_COLORS.textMuted }}>
            Click for details
          </span>
        )}
      </div>
    </div>
  );
}

function AssessmentSection({ profileId, onViewDetails }: { profileId: string; onViewDetails?: (data: Record<string, unknown>) => void }) {
  // HYBRID APPROACH: Database (Four Pillars, Brand Statement) + Agno API (CRI, real-time)
  const { data: identity, isLoading: identityLoading } = useProfileIdentity(profileId);
  const { data: agnoData, isLoading: agnoLoading, isError, error, refetch } = useAssessmentEnhancement(profileId);
  // 🆕 V3: Full assessment with scoring primitives (TYPE-085, TYPE-086, TYPE-083)
  const { data: fullAssessment, isLoading: fullLoading, refetch: refetchFull } = useFullAssessment(profileId);

  // DEBUG: Log what we're getting from each source
  console.log('[AssessmentSection] profileId:', profileId);
  console.log('[AssessmentSection] identity from useProfileIdentity:', identity);
  console.log('[AssessmentSection] agnoData from useAssessmentEnhancement:', agnoData);
  console.log('[AssessmentSection] fullAssessment:', fullAssessment);

  const isLoading = identityLoading && agnoLoading && fullLoading;
  const hasData = identity || agnoData || fullAssessment;

  // Merge data: prefer DB (identity) for rich data, Agno for enhancements
  // 🆕 FIX: Fall back to agnoData.brand_statement if DB doesn't have it
  const brandStatement = identity?.brandStatement || agnoData?.brand_statement || '';
  const narrativeDna = identity?.narrativeDna || agnoData?.narrative_dna || '';
  const pillars = identity?.pillars || [];
  const themes = identity?.narrativeThemes || agnoData?.themes || [];
  const spike = identity?.spike || '';
  const archetypeName = identity?.archetypeName || (agnoData?.archetype?.label ? String(agnoData.archetype.label) : '');
  const archetypeConfidence = identity?.archetypeConfidence || agnoData?.archetype?.confidence || 0;
  const cri = agnoData?.cri || 0;

  // 🆕 V2 Multi-Dimensional Archetype data
  const archetypeV2 = agnoData?.archetype_v2 || null;
  const diversityAngles = archetypeV2?.diversity_angles || [];
  const compositeCode = archetypeV2?.composite_code || '';
  const executionStyle = archetypeV2?.execution_style || '';
  const isUrm = archetypeV2?.is_urm || false;
  const isFirstGen = archetypeV2?.is_first_gen || false;

  // 🆕 V3: New Scoring Primitives (TYPE-085, TYPE-086, TYPE-083)
  const ivyPlusScore = fullAssessment?.ivy_plus_score || 0;
  const rubric5d = fullAssessment?.rubric_5d || null;
  const gapAnalysis = fullAssessment?.gap_analysis || null;
  const potentialIndicators = fullAssessment?.potential_indicators || null;

  // Extract summary metrics for card display
  const rubricTotal = rubric5d?.total_score || 0;
  const p0GapCount = gapAnalysis?.p0_gaps?.length || 0;
  const p1GapCount = gapAnalysis?.p1_gaps?.length || 0;
  const hiddenStrengthsCount = potentialIndicators?.hidden_strengths?.length || 0;
  const untappedOppsCount = potentialIndicators?.untapped_opportunities?.length || 0;

  // DEBUG: Log merged values
  console.log('[AssessmentSection] Merged data:', { brandStatement, narrativeDna, pillars, themes, spike, archetypeName, archetypeV2, rubric5d, gapAnalysis });

  // Combined data for detail view
  const combinedData = {
    brandStatement,
    narrativeDna,
    pillars,
    themes,
    spike,
    archetype: { name: archetypeName, confidence: archetypeConfidence },
    archetype_v2: archetypeV2,
    cri,
    identitySynthesis: identity?.identitySynthesis || {},
    // 🆕 V3: Include full assessment data for detail view
    ivy_plus_score: ivyPlusScore,
    rubric_5d: rubric5d,
    gap_analysis: gapAnalysis,
    potential_indicators: potentialIndicators,
    ...agnoData,
    ...fullAssessment,
  };

  return (
    <AgentCard
      name="Assessment Agent"
      icon={<Brain size={20} style={{ color: BRAND_COLORS.primary }} />}
      status={isLoading ? 'loading' : isError ? 'error' : hasData ? 'success' : 'idle'}
      error={error?.message}
      onRefresh={() => refetch()}
      onClick={hasData && onViewDetails ? () => onViewDetails(combinedData as Record<string, unknown>) : undefined}
    >
      {hasData ? (
        <div className="space-y-3">
          {/* Brand Statement - Primary Display (North Star) */}
          {brandStatement && (
            <div>
              <p style={{ color: BRAND_COLORS.textMuted }} className="text-xs uppercase tracking-wide mb-1">
                Brand Statement
              </p>
              <p style={{ color: BRAND_COLORS.textPrimary }} className="text-sm italic line-clamp-3">
                "{brandStatement}"
              </p>
            </div>
          )}

          {/* Four Pillars Display */}
          {pillars.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={14} style={{ color: BRAND_COLORS.warning }} />
                <span className="text-sm font-medium" style={{ color: BRAND_COLORS.textSecondary }}>Identity Pillars</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pillars.slice(0, 4).map((pillar, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ backgroundColor: BRAND_COLORS.primaryBg, color: BRAND_COLORS.primary }}
                  >
                    {pillar}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Narrative DNA (fallback if no brand statement) */}
          {!brandStatement && narrativeDna && (
            <NarrativeDNACard narrativeDNA={narrativeDna} compact />
          )}

          {/* Themes */}
          {themes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {themes.slice(0, 3).map((theme: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ backgroundColor: BRAND_COLORS.primaryBg, color: BRAND_COLORS.primary }}
                >
                  {theme}
                </span>
              ))}
            </div>
          )}

          {/* Archetype - Enhanced with V2 Data */}
          {archetypeName && (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: BRAND_COLORS.bgSecondary, border: `1px solid ${BRAND_COLORS.borderLight}` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: BRAND_COLORS.textSecondary }}>Archetype</span>
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: BRAND_COLORS.secondary, color: '#ffffff' }}
                >
                  {archetypeName}
                </span>
              </div>
              {archetypeConfidence > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: BRAND_COLORS.borderLight }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${archetypeConfidence * 100}%`, backgroundColor: BRAND_COLORS.primary }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>{Math.round(archetypeConfidence * 100)}%</span>
                </div>
              )}
              {/* V2: Composite Code */}
              {compositeCode && (
                <div className="mt-2">
                  <span className="text-xs font-mono" style={{ color: BRAND_COLORS.textMuted }}>{compositeCode}</span>
                </div>
              )}
              {/* V2: Execution Style */}
              {executionStyle && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Execution:</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={{ backgroundColor: BRAND_COLORS.primaryBg, color: BRAND_COLORS.primary }}
                  >
                    {executionStyle.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* V2: Diversity Angles - Strategic Positioning */}
          {diversityAngles.length > 0 && (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: BRAND_COLORS.bgSuccess, border: `1px solid ${BRAND_COLORS.success}40` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium" style={{ color: BRAND_COLORS.success }}>Diversity Angles</span>
                {isUrm && (
                  <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: BRAND_COLORS.success, color: '#ffffff' }}>
                    URM
                  </span>
                )}
                {isFirstGen && (
                  <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: BRAND_COLORS.success, color: '#ffffff' }}>
                    First-Gen
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {diversityAngles.map((angle: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ backgroundColor: '#ffffff', color: BRAND_COLORS.textPrimary, border: `1px solid ${BRAND_COLORS.success}40` }}
                  >
                    {angle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CRI from Agno */}
          {cri > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Context Relativity Index</span>
              <span className="text-lg font-bold" style={{ color: BRAND_COLORS.primary }}>{cri.toFixed(2)}</span>
            </div>
          )}

          {/* V3: Ivy+ Score Hero */}
          {ivyPlusScore > 0 && (
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold" style={{ color: BRAND_COLORS.primary }}>{ivyPlusScore.toFixed(0)}</div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: BRAND_COLORS.textHeading }}>Ivy+ Ready Score</div>
                <div className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                  {ivyPlusScore >= 70 ? 'Competitive' : ivyPlusScore >= 50 ? 'Developing' : 'Emerging'}
                </div>
              </div>
            </div>
          )}

          {/* 5-Dimension Rubric (TYPE-085) */}
          {rubric5d && (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: BRAND_COLORS.bgSecondary, border: `1px solid ${BRAND_COLORS.borderLight}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: BRAND_COLORS.textSecondary }}>5-Dimension Rubric</span>
                <span className="text-lg font-bold" style={{ color: BRAND_COLORS.primary }}>{rubricTotal}/50</span>
              </div>
              {/* Dimension mini-bars */}
              <div className="space-y-1.5">
                {(['academics', 'leadership', 'service', 'artifacts', 'recognition'] as const).map((dim) => {
                  const dimData = rubric5d?.[dim as keyof typeof rubric5d] as { score?: number; gap?: number } | undefined;
                  const score = dimData?.score || 0;
                  const isP0 = (dimData?.gap || 0) >= 5;
                  return (
                    <div key={dim} className="flex items-center gap-2">
                      <span
                        className="text-xs w-20 capitalize"
                        style={{ color: isP0 ? BRAND_COLORS.error : BRAND_COLORS.textMuted, fontWeight: isP0 ? 500 : 400 }}
                      >
                        {dim}{isP0 && <span style={{ color: BRAND_COLORS.error }} className="ml-1">P0</span>}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: BRAND_COLORS.borderLight }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${score * 10}%`,
                            backgroundColor: score >= 8 ? BRAND_COLORS.success : score >= 5 ? BRAND_COLORS.warning : BRAND_COLORS.error
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8 text-right" style={{ color: BRAND_COLORS.textPrimary }}>{score}/10</span>
                    </div>
                  );
                })}
              </div>
              {/* Priority Focus */}
              {gapAnalysis?.primary_focus && (
                <div className="mt-2 pt-2 flex items-center gap-1" style={{ borderTop: `1px solid ${BRAND_COLORS.borderLight}` }}>
                  <Flame size={12} style={{ color: BRAND_COLORS.error }} />
                  <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                    Priority Focus: <span className="font-medium capitalize" style={{ color: BRAND_COLORS.error }}>{gapAnalysis.primary_focus}</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Gap Priority Analysis (TYPE-086) */}
          {gapAnalysis && (p0GapCount > 0 || p1GapCount > 0) && (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: BRAND_COLORS.bgSecondary, border: `1px solid ${BRAND_COLORS.borderLight}` }}
            >
              <div className="text-sm font-medium mb-2" style={{ color: BRAND_COLORS.textSecondary }}>Gap Priority Analysis</div>
              {/* Gap Lists by Priority */}
              <div className="space-y-2 mb-3">
                {/* P0 Gaps - Critical */}
                {gapAnalysis?.p0_gaps && gapAnalysis.p0_gaps.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 text-xs font-bold rounded shrink-0" style={{ backgroundColor: BRAND_COLORS.errorBg, color: BRAND_COLORS.error }}>P0</span>
                    <div className="flex flex-wrap gap-1">
                      {(gapAnalysis.p0_gaps as string[]).map((gap: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 text-xs rounded capitalize" style={{ backgroundColor: `${BRAND_COLORS.error}15`, color: BRAND_COLORS.error }}>
                          {gap.replace(/_/g, ' ')}
                        </span>
                      ))}
                      <span className="text-xs italic ml-1" style={{ color: BRAND_COLORS.error }}>Critical - address immediately</span>
                    </div>
                  </div>
                )}
                {/* P1 Gaps - High */}
                {gapAnalysis?.p1_gaps && gapAnalysis.p1_gaps.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 text-xs font-bold rounded shrink-0" style={{ backgroundColor: BRAND_COLORS.warningBg, color: BRAND_COLORS.warning }}>P1</span>
                    <div className="flex flex-wrap gap-1">
                      {(gapAnalysis.p1_gaps as string[]).map((gap: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 text-xs rounded capitalize" style={{ backgroundColor: `${BRAND_COLORS.warning}15`, color: BRAND_COLORS.warning }}>
                          {gap.replace(/_/g, ' ')}
                        </span>
                      ))}
                      <span className="text-xs italic ml-1" style={{ color: BRAND_COLORS.warning }}>High - address in 8 weeks</span>
                    </div>
                  </div>
                )}
                {/* P2 Gaps - Medium */}
                {gapAnalysis?.p2_gaps && (gapAnalysis.p2_gaps as string[]).length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 text-xs font-bold rounded shrink-0" style={{ backgroundColor: BRAND_COLORS.warningBg, color: BRAND_COLORS.warning }}>P2</span>
                    <div className="flex flex-wrap gap-1">
                      {(gapAnalysis.p2_gaps as string[]).map((gap: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 text-xs rounded capitalize" style={{ backgroundColor: `${BRAND_COLORS.warning}15`, color: BRAND_COLORS.warning }}>
                          {gap.replace(/_/g, ' ')}
                        </span>
                      ))}
                      <span className="text-xs italic ml-1" style={{ color: BRAND_COLORS.warning }}>Medium - this semester</span>
                    </div>
                  </div>
                )}
                {/* P3 Gaps - Low */}
                {gapAnalysis?.p3_gaps && (gapAnalysis.p3_gaps as string[]).length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 text-xs font-bold rounded shrink-0" style={{ backgroundColor: BRAND_COLORS.bgSuccess, color: BRAND_COLORS.success }}>P3</span>
                    <div className="flex flex-wrap gap-1">
                      {(gapAnalysis.p3_gaps as string[]).map((gap: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 text-xs rounded capitalize" style={{ backgroundColor: `${BRAND_COLORS.success}15`, color: BRAND_COLORS.success }}>
                          {gap.replace(/_/g, ' ')}
                        </span>
                      ))}
                      <span className="text-xs italic ml-1" style={{ color: BRAND_COLORS.success }}>Low - nice to have</span>
                    </div>
                  </div>
                )}
              </div>
              {/* Top Actions Preview */}
              {gapAnalysis?.top_3_actions && gapAnalysis.top_3_actions.length > 0 && (
                <div className="pt-2" style={{ borderTop: `1px solid ${BRAND_COLORS.borderLight}` }}>
                  <div className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.textMuted }}>Recommended Actions</div>
                  {(gapAnalysis.top_3_actions as Array<{action?: string; expected_boost?: string}>).slice(0, 3).map((action: {action?: string; expected_boost?: string}, i: number) => (
                    <div key={i} className="text-xs flex items-start gap-1 mt-1" style={{ color: BRAND_COLORS.textSecondary }}>
                      <span style={{ color: BRAND_COLORS.primary }}>•</span>
                      <span>{action.action}</span>
                      {action.expected_boost && <span className="ml-auto whitespace-nowrap" style={{ color: BRAND_COLORS.textMuted }}>Impact: {action.expected_boost}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hidden Potential (TYPE-083) */}
          {potentialIndicators && hiddenStrengthsCount > 0 && (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: BRAND_COLORS.bgSuccess, border: `1px solid ${BRAND_COLORS.success}40` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={16} style={{ color: BRAND_COLORS.success }} />
                <span className="text-sm font-medium" style={{ color: BRAND_COLORS.success }}>Hidden Strengths</span>
                <span
                  className="ml-auto px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: BRAND_COLORS.success, color: '#ffffff' }}
                >
                  {hiddenStrengthsCount} detected
                </span>
              </div>
              {/* Show first 2 hidden strengths */}
              <div className="space-y-1">
                {(potentialIndicators.hidden_strengths as Array<{skill_category?: string; recommendation?: string}>)?.slice(0, 2).map((hs: {skill_category?: string; recommendation?: string}, i: number) => (
                  <div key={i} className="text-xs flex items-start gap-1" style={{ color: BRAND_COLORS.textSecondary }}>
                    <span style={{ color: BRAND_COLORS.success }}>→</span>
                    <span className="capitalize">{hs.skill_category?.replace(/_/g, ' ')}</span>
                    {hs.recommendation && <span style={{ color: BRAND_COLORS.textMuted }}>: {hs.recommendation}</span>}
                  </div>
                ))}
                {hiddenStrengthsCount > 2 && (
                  <div className="text-xs" style={{ color: BRAND_COLORS.success }}>+{hiddenStrengthsCount - 2} more in details...</div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Loading assessment data...</p>}
    </AgentCard>
  );
}

function ECAgentSection({ profileId, onViewDetails }: { profileId: string; onViewDetails?: (data: Record<string, unknown>) => void }) {
  const { data, isLoading, isError, error, refetch } = useGamePlan(profileId);
  const identity = data?.game_plan?.identity_synthesis;
  const portfolio = data?.game_plan?.portfolio_analysis;

  return (
    <AgentCard
      name="EC Agent"
      icon={<User size={20} style={{ color: BRAND_COLORS.primary }} />}
      status={isLoading ? 'loading' : isError ? 'error' : identity ? 'success' : 'idle'}
      error={error?.message}
      onRefresh={() => refetch()}
      onClick={identity && onViewDetails ? () => onViewDetails({ identity_synthesis: identity, portfolio_analysis: portfolio, ...data }) : undefined}
    >
      {identity ? (
        <div className="space-y-3">
          {/* Archetype */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target size={14} style={{ color: BRAND_COLORS.primary }} />
                <span className="text-sm font-medium" style={{ color: BRAND_COLORS.textSecondary }}>Archetype</span>
              </div>
              <span
                className="px-2 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: BRAND_COLORS.secondary, color: '#ffffff' }}
              >
                {String(identity.archetype || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            {identity.archetype_confidence && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: BRAND_COLORS.borderLight }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${Number(identity.archetype_confidence) * 100}%`, backgroundColor: BRAND_COLORS.primary }}
                  />
                </div>
                <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>{Math.round(Number(identity.archetype_confidence) * 100)}%</span>
              </div>
            )}
          </div>

          {/* Spike */}
          {identity.spike && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} style={{ color: BRAND_COLORS.warning }} />
                <span className="text-sm font-medium" style={{ color: BRAND_COLORS.textSecondary }}>Spike</span>
              </div>
              <p className="text-sm font-medium" style={{ color: BRAND_COLORS.primary }}>
                {String(identity.spike).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              {identity.spike_evidence && Array.isArray(identity.spike_evidence) && identity.spike_evidence.length > 0 && (
                <div className="mt-2 space-y-1">
                  {(identity.spike_evidence as string[]).slice(0, 2).map((ev, i) => (
                    <p key={i} className="text-xs flex items-start gap-1" style={{ color: BRAND_COLORS.textMuted }}>
                      <ChevronRight size={12} className="mt-0.5 flex-shrink-0" />
                      {ev}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pillars */}
          {identity.pillars && Array.isArray(identity.pillars) && (identity.pillars as string[]).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={14} style={{ color: BRAND_COLORS.primary }} />
                <span className="text-sm font-medium" style={{ color: BRAND_COLORS.textSecondary }}>Identity Pillars</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(identity.pillars as string[]).map((pillar, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ backgroundColor: BRAND_COLORS.primaryBg, color: BRAND_COLORS.primary }}
                  >
                    {typeof pillar === 'object'
                      ? ((pillar as Record<string, unknown>).name as string || (pillar as Record<string, unknown>).label as string || JSON.stringify(pillar))
                      : String(pillar)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Summary */}
          {portfolio && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} style={{ color: BRAND_COLORS.success }} />
                <span className="text-sm font-medium" style={{ color: BRAND_COLORS.textSecondary }}>Portfolio Analysis</span>
              </div>
              {portfolio.strengths && Array.isArray(portfolio.strengths) && (portfolio.strengths as string[]).length > 0 && (
                <div className="mb-2">
                  <p className="text-xs mb-1" style={{ color: BRAND_COLORS.textMuted }}>Strengths:</p>
                  <div className="flex flex-wrap gap-1">
                    {(portfolio.strengths as string[]).slice(0, 3).map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: BRAND_COLORS.bgSuccess, color: BRAND_COLORS.success }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {portfolio.gaps && Array.isArray(portfolio.gaps) && (portfolio.gaps as string[]).length > 0 && (
                <div>
                  <p className="text-xs mb-1" style={{ color: BRAND_COLORS.textMuted }}>Gaps:</p>
                  <div className="flex flex-wrap gap-1">
                    {(portfolio.gaps as string[]).slice(0, 3).map((g, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: BRAND_COLORS.warningBg, color: BRAND_COLORS.warning }}>{g}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Loading EC analysis...</p>}
    </AgentCard>
  );
}

function GamePlanSection({ profileId, onViewDetails }: { profileId: string; onViewDetails?: (data: Record<string, unknown>) => void }) {
  const { data, isLoading, isError, error, refetch } = useGamePlan(profileId);
  const [expandedSection, setExpandedSection] = useState<'activities' | 'seeds' | 'phases' | null>(null);

  const toggleSection = (section: 'activities' | 'seeds' | 'phases') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <AgentCard
      name="Game Plan Agent"
      icon={<Map size={20} style={{ color: BRAND_COLORS.primary }} />}
      status={isLoading ? 'loading' : isError ? 'error' : data ? 'success' : 'idle'}
      error={error?.message}
      onRefresh={() => refetch()}
      onClick={data && onViewDetails ? () => onViewDetails(data as Record<string, unknown>) : undefined}
    >
      {data?.game_plan ? (
        <div className="space-y-3">
          {/* Summary Stats - Clickable */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); toggleSection('activities'); }}
              className="rounded-lg p-3 text-center transition-all hover:opacity-80"
              style={{
                backgroundColor: expandedSection === 'activities' ? BRAND_COLORS.primaryBg : BRAND_COLORS.bgSecondary,
                border: `1px solid ${expandedSection === 'activities' ? BRAND_COLORS.primary : BRAND_COLORS.borderLight}`,
              }}
            >
              <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>{data.game_plan.activities?.length || 0}</p>
              <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Activities</p>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleSection('seeds'); }}
              className="rounded-lg p-3 text-center transition-all hover:opacity-80"
              style={{
                backgroundColor: expandedSection === 'seeds' ? BRAND_COLORS.primaryBg : BRAND_COLORS.bgSecondary,
                border: `1px solid ${expandedSection === 'seeds' ? BRAND_COLORS.primary : BRAND_COLORS.borderLight}`,
              }}
            >
              <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>{data.game_plan.identity_seeds?.length || 0}</p>
              <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Seeds</p>
            </button>
          </div>

          {/* Expanded Activities View */}
          {expandedSection === 'activities' && data.game_plan.activities && (data.game_plan.activities as unknown[]).length > 0 && (
            <div
              className="rounded-lg p-3 max-h-64 overflow-y-auto"
              style={{ backgroundColor: BRAND_COLORS.primaryBg, border: `1px solid ${BRAND_COLORS.primary}40` }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.primary }}>All Activities</p>
              <div className="space-y-2">
                {(data.game_plan.activities as Array<{ type?: string; name?: string; description?: string; category?: string; touchpoints?: string[] }>).map((activity, i) => (
                  <div
                    key={i}
                    className="rounded p-2 text-sm"
                    style={{ backgroundColor: '#ffffff', border: `1px solid ${BRAND_COLORS.borderLight}` }}
                  >
                    <div className="flex items-start gap-2">
                      <Activity className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: BRAND_COLORS.primary }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium" style={{ color: BRAND_COLORS.textHeading }}>{activity.name || `Activity ${i + 1}`}</p>
                        {activity.description && <p className="text-xs mt-0.5 line-clamp-2" style={{ color: BRAND_COLORS.textMuted }}>{activity.description}</p>}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {activity.type && <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: BRAND_COLORS.bgSecondary, color: BRAND_COLORS.textSecondary }}>{activity.type}</span>}
                          {activity.category && <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: BRAND_COLORS.primaryBg, color: BRAND_COLORS.primary }}>{activity.category}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expanded Seeds View */}
          {expandedSection === 'seeds' && data.game_plan.identity_seeds && (data.game_plan.identity_seeds as unknown[]).length > 0 && (
            <div
              className="rounded-lg p-3 max-h-64 overflow-y-auto"
              style={{ backgroundColor: BRAND_COLORS.bgSuccess, border: `1px solid ${BRAND_COLORS.success}40` }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.success }}>Identity Seeds</p>
              <div className="space-y-2">
                {(data.game_plan.identity_seeds as Array<{ type?: string; name?: string; description?: string; planted?: boolean; confidence?: number; evidence?: string[] }>).map((seed, i) => (
                  <div
                    key={i}
                    className="rounded p-2 text-sm"
                    style={{ backgroundColor: '#ffffff', border: `1px solid ${BRAND_COLORS.borderLight}` }}
                  >
                    <div className="flex items-start gap-2">
                      <TreeDeciduous
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: seed.planted ? BRAND_COLORS.success : BRAND_COLORS.warning }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium" style={{ color: BRAND_COLORS.textHeading }}>{seed.name}</p>
                          <span
                            className="px-1.5 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: seed.planted ? BRAND_COLORS.bgSuccess : BRAND_COLORS.bgWarning,
                              color: seed.planted ? BRAND_COLORS.success : BRAND_COLORS.warning
                            }}
                          >
                            {seed.planted ? 'Planted' : 'Opportunity'}
                          </span>
                        </div>
                        {seed.description && <p className="text-xs mt-0.5" style={{ color: BRAND_COLORS.textMuted }}>{seed.description}</p>}
                        {seed.confidence && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 rounded-full h-1" style={{ backgroundColor: BRAND_COLORS.borderLight }}>
                              <div className="h-1 rounded-full" style={{ width: `${seed.confidence * 100}%`, backgroundColor: BRAND_COLORS.success }} />
                            </div>
                            <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>{Math.round(seed.confidence * 100)}%</span>
                          </div>
                        )}
                        {seed.evidence && seed.evidence.length > 0 && (
                          <div className="mt-1">
                            {seed.evidence.slice(0, 2).map((ev, j) => (
                              <p key={j} className="text-xs flex items-start gap-1" style={{ color: BRAND_COLORS.textMuted }}>
                                <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {ev}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phases - Clickable Header */}
          {data.game_plan.phases && (data.game_plan.phases as unknown[]).length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('phases')}
                className="w-full flex items-center justify-between p-2 rounded-lg transition-all hover:opacity-80"
                style={{
                  backgroundColor: expandedSection === 'phases' ? BRAND_COLORS.bgSecondary : 'transparent',
                }}
              >
                <span className="text-sm font-medium" style={{ color: BRAND_COLORS.textSecondary }}>
                  {(data.game_plan.phases as unknown[]).length} Strategic Phases
                </span>
                {expandedSection === 'phases' ? (
                  <ChevronDown className="w-4 h-4" style={{ color: BRAND_COLORS.textMuted }} />
                ) : (
                  <ChevronRight className="w-4 h-4" style={{ color: BRAND_COLORS.textMuted }} />
                )}
              </button>

              {/* Collapsed Phase Summary */}
              {expandedSection !== 'phases' && (
                <div className="space-y-1 mt-1">
                  {(data.game_plan.phases as Array<{ name?: string; activity_count?: number }>).slice(0, 3).map((phase, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm pl-2" style={{ color: BRAND_COLORS.textSecondary }}>
                      <ChevronRight className="w-3 h-3" style={{ color: BRAND_COLORS.primary }} />
                      <span className="font-medium">{phase.name}:</span>
                      <span>{phase.activity_count || 0} activities</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Expanded Phases View */}
              {expandedSection === 'phases' && (
                <div className="mt-2 space-y-3">
                  {(data.game_plan.phases as Array<{ name?: string; duration?: string; focus?: string; activities?: Array<{ name?: string; description?: string; type?: string }>; activity_count?: number }>).map((phase, i) => (
                    <div
                      key={i}
                      className="rounded-lg p-3"
                      style={{ backgroundColor: '#ffffff', border: `1px solid ${BRAND_COLORS.borderLight}` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              backgroundColor: i === 0 ? BRAND_COLORS.primaryBg : i === 1 ? BRAND_COLORS.secondaryBg : BRAND_COLORS.bgSuccess,
                              color: i === 0 ? BRAND_COLORS.primary : i === 1 ? BRAND_COLORS.secondary : BRAND_COLORS.success
                            }}
                          >
                            {i + 1}
                          </div>
                          <span className="font-medium" style={{ color: BRAND_COLORS.textHeading }}>{phase.name}</span>
                        </div>
                        {phase.duration && <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>{phase.duration}</span>}
                      </div>
                      {phase.focus && <p className="text-xs mb-2" style={{ color: BRAND_COLORS.textMuted }}>{phase.focus}</p>}
                      {phase.activities && phase.activities.length > 0 && (
                        <div className="space-y-1">
                          {phase.activities.map((act, j) => (
                            <div key={j} className="flex items-start gap-2 text-xs" style={{ color: BRAND_COLORS.textSecondary }}>
                              <Activity className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: BRAND_COLORS.primary }} />
                              <div>
                                <span className="font-medium">{act.name}</span>
                                {act.description && <span style={{ color: BRAND_COLORS.textMuted }}> - {act.description}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Strategic Insights */}
          {data.game_plan.strategic_insights && (data.game_plan.strategic_insights as string[]).length > 0 && (
            <div
              className="rounded-lg p-2"
              style={{ backgroundColor: BRAND_COLORS.bgWarning, border: `1px solid ${BRAND_COLORS.warning}40` }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.warning }}>Key Insights</p>
              <ul className="space-y-1">
                {(data.game_plan.strategic_insights as string[]).slice(0, 2).map((insight, i) => (
                  <li key={i} className="text-xs flex items-start gap-1" style={{ color: BRAND_COLORS.textSecondary }}>
                    <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: BRAND_COLORS.warning }} />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Loading game plan...</p>}
    </AgentCard>
  );
}

function ExecutionSection({ profileId, onViewDetails }: { profileId: string; onViewDetails?: (data: Record<string, unknown>) => void }) {
  const { data: eds, isLoading, isError, error, refetch } = useExecutionDebtScore(profileId);

  const getStatusStyle = (status: string) => {
    if (status === 'healthy') return { backgroundColor: BRAND_COLORS.bgSuccess, color: BRAND_COLORS.success };
    if (status === 'at_risk') return { backgroundColor: BRAND_COLORS.bgWarning, color: BRAND_COLORS.warning };
    return { backgroundColor: BRAND_COLORS.bgError, color: BRAND_COLORS.error };
  };

  const getBarColor = (status: string) => {
    if (status === 'healthy') return BRAND_COLORS.success;
    if (status === 'at_risk') return BRAND_COLORS.warning;
    return BRAND_COLORS.error;
  };

  return (
    <AgentCard
      name="Execution Agent"
      icon={<Zap size={20} style={{ color: BRAND_COLORS.primary }} />}
      status={isLoading ? 'loading' : isError ? 'error' : eds ? 'success' : 'idle'}
      error={error?.message}
      onRefresh={() => refetch()}
      onClick={eds && onViewDetails ? () => onViewDetails(eds as Record<string, unknown>) : undefined}
    >
      {eds ? (
        <div className="space-y-4">
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: '#ffffff', border: `1px solid ${BRAND_COLORS.borderLight}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: BRAND_COLORS.textSecondary }}>Execution Debt Score</span>
              <span
                className="px-2 py-1 rounded text-xs font-medium"
                style={getStatusStyle(eds.status)}
              >
                {eds.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-end gap-4">
              <div className="text-4xl font-bold" style={{ color: BRAND_COLORS.textHeading }}>{Math.round(eds.execution_debt_score)}</div>
              <div className="flex-1">
                <div className="w-full rounded-full h-2" style={{ backgroundColor: BRAND_COLORS.borderLight }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (eds.execution_debt_score / 100) * 100)}%`,
                      backgroundColor: getBarColor(eds.status)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Loading execution data...</p>}
    </AgentCard>
  );
}

function AwardsSection({ profileId, onViewDetails }: { profileId: string; onViewDetails?: (data: Record<string, unknown>) => void }) {
  const { data, isLoading, isError, error, refetch } = useAwardMatches(profileId);
  const [expandedCategory, setExpandedCategory] = useState<'reach' | 'target' | 'safety' | null>(null);

  // Get portfolio from the awards data or from game plan data
  const portfolio = data?.portfolio;

  // Support both old (likely/target/stretch) and new (reach/target/safety) field names
  const reachCount = portfolio?.reach?.length || portfolio?.likely?.length || 0;
  const targetCount = portfolio?.target?.length || 0;
  const safetyCount = portfolio?.safety?.length || portfolio?.stretch?.length || 0;
  const totalCount = reachCount + targetCount + safetyCount;

  const getAwardsForCategory = (category: 'reach' | 'target' | 'safety') => {
    if (!portfolio) return [];
    if (category === 'reach') return portfolio.reach || portfolio.likely || [];
    if (category === 'target') return portfolio.target || [];
    if (category === 'safety') return portfolio.safety || portfolio.stretch || [];
    return [];
  };

  const getCategoryColors = (category: 'reach' | 'target' | 'safety') => {
    if (category === 'reach') return { bg: BRAND_COLORS.primaryBg, color: BRAND_COLORS.primary, border: `${BRAND_COLORS.primary}40` };
    if (category === 'target') return { bg: BRAND_COLORS.bgWarning, color: BRAND_COLORS.warning, border: `${BRAND_COLORS.warning}40` };
    return { bg: BRAND_COLORS.bgSuccess, color: BRAND_COLORS.success, border: `${BRAND_COLORS.success}40` };
  };

  return (
    <AgentCard
      name="Awards Agent"
      icon={<Award size={20} style={{ color: BRAND_COLORS.primary }} />}
      status={isLoading ? 'loading' : isError ? 'error' : data ? 'success' : 'idle'}
      error={error?.message}
      onRefresh={() => refetch()}
      onClick={data && onViewDetails ? () => onViewDetails(data as Record<string, unknown>) : undefined}
    >
      {portfolio ? (
        <div className="space-y-3">
          {/* Summary - Clickable */}
          <div className="grid grid-cols-3 gap-2">
            {(['reach', 'target', 'safety'] as const).map((cat) => {
              const colors = getCategoryColors(cat);
              const count = cat === 'reach' ? reachCount : cat === 'target' ? targetCount : safetyCount;
              const isExpanded = expandedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                  className="rounded-lg p-2 text-center transition-all hover:opacity-80"
                  style={{
                    backgroundColor: colors.bg,
                    border: isExpanded ? `2px solid ${colors.color}` : `1px solid ${colors.border}`,
                  }}
                >
                  <p className="text-lg font-bold" style={{ color: colors.color }}>{count}</p>
                  <p className="text-xs capitalize" style={{ color: BRAND_COLORS.textMuted }}>{cat}</p>
                </button>
              );
            })}
          </div>

          {/* Expanded Awards View */}
          {expandedCategory && getAwardsForCategory(expandedCategory).length > 0 && (
            <div
              className="rounded-lg p-3 max-h-48 overflow-y-auto"
              style={{
                backgroundColor: getCategoryColors(expandedCategory).bg,
                border: `1px solid ${getCategoryColors(expandedCategory).border}`,
              }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: getCategoryColors(expandedCategory).color }}>
                {expandedCategory.charAt(0).toUpperCase() + expandedCategory.slice(1)} Awards
              </p>
              <div className="space-y-2">
                {getAwardsForCategory(expandedCategory).map((award: { name?: string; organization?: string; description?: string; selectivity?: number; deadline?: string; fit_score?: number }, i: number) => (
                  <div
                    key={i}
                    className="rounded p-2 text-sm"
                    style={{ backgroundColor: '#ffffff', border: `1px solid ${BRAND_COLORS.borderLight}` }}
                  >
                    <div className="flex items-start gap-2">
                      <Award
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: getCategoryColors(expandedCategory).color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium" style={{ color: BRAND_COLORS.textHeading }}>{award.name}</p>
                        {award.organization && <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>{award.organization}</p>}
                        {award.description && <p className="text-xs mt-0.5 line-clamp-2" style={{ color: BRAND_COLORS.textMuted }}>{award.description}</p>}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {award.selectivity !== undefined && (
                            <span
                              className="px-1.5 py-0.5 rounded text-xs"
                              style={{ backgroundColor: BRAND_COLORS.bgSecondary, color: BRAND_COLORS.textSecondary }}
                            >
                              {Math.round(award.selectivity * 100)}% sel.
                            </span>
                          )}
                          {award.fit_score !== undefined && (
                            <span
                              className="px-1.5 py-0.5 rounded text-xs"
                              style={{ backgroundColor: BRAND_COLORS.bgWarning, color: BRAND_COLORS.warning }}
                            >
                              {Math.round(award.fit_score * 100)}% fit
                            </span>
                          )}
                          {award.deadline && (
                            <span
                              className="px-1.5 py-0.5 rounded text-xs"
                              style={{ backgroundColor: BRAND_COLORS.infoBg, color: BRAND_COLORS.info }}
                            >
                              {award.deadline}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className="rounded-lg p-2 text-center"
              style={{ backgroundColor: '#ffffff', border: `1px solid ${BRAND_COLORS.borderLight}` }}
            >
              <p className="text-lg font-bold" style={{ color: BRAND_COLORS.warning }}>{totalCount}</p>
              <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Total Matched</p>
            </div>
            <div
              className="rounded-lg p-2 text-center"
              style={{ backgroundColor: '#ffffff', border: `1px solid ${BRAND_COLORS.borderLight}` }}
            >
              <p className="text-lg font-bold" style={{ color: BRAND_COLORS.warning }}>{portfolio.expected_wins?.toFixed(1) || '~'}</p>
              <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Expected Wins</p>
            </div>
          </div>
        </div>
      ) : <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Loading award matches...</p>}
    </AgentCard>
  );
}

function OpportunitiesSection({ profileId, onViewDetails }: { profileId: string; onViewDetails?: (data: Record<string, unknown>) => void }) {
  const { data, isLoading, isError, error, refetch } = useOpportunityMatches(profileId);
  const gamePlanData = useGamePlan(profileId);
  const alerts = useOpportunityAlerts(profileId);
  const [showPrograms, setShowPrograms] = useState(false);

  // Get programs from game plan as fallback
  const programs = gamePlanData.data?.game_plan?.programs;
  const programPortfolio = programs?.portfolio;
  const reachPrograms = programPortfolio?.reach || [];
  const targetPrograms = programPortfolio?.target || [];
  const safetyPrograms = programPortfolio?.safety || [];
  const allPrograms = [...reachPrograms, ...targetPrograms, ...safetyPrograms];

  // Use game plan summary for counts
  const totalProgramsMatched = gamePlanData.data?.game_plan?.summary?.total_programs_matched || allPrograms.length;

  // Prefer dedicated opportunities data, fall back to game plan programs
  const matchCount = data?.matches?.length || totalProgramsMatched;
  const hasData = data || totalProgramsMatched > 0;
  const isLoadingAny = isLoading || gamePlanData.isLoading;

  // Use secondary (maroon) as the accent color for Programs
  const programColor = BRAND_COLORS.secondary;
  const programBg = BRAND_COLORS.secondaryBg;

  return (
    <AgentCard
      name="Programs Agent"
      icon={<GraduationCap size={20} style={{ color: BRAND_COLORS.primary }} />}
      status={isLoadingAny ? 'loading' : isError ? 'error' : hasData ? 'success' : 'idle'}
      error={error?.message}
      onRefresh={() => { refetch(); gamePlanData.refetch(); }}
      onClick={hasData && onViewDetails ? () => onViewDetails({ ...data, programs, allPrograms, alerts: alerts.data } as Record<string, unknown>) : undefined}
    >
      {hasData ? (
        <div className="space-y-3">
          {/* Summary Stats - Clickable */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setShowPrograms(!showPrograms)}
              className="rounded-lg p-2 text-center transition-all hover:opacity-80"
              style={{
                backgroundColor: showPrograms ? programBg : '#ffffff',
                border: showPrograms ? `2px solid ${programColor}` : `1px solid ${BRAND_COLORS.borderLight}`,
              }}
            >
              <p className="text-lg font-bold" style={{ color: programColor }}>{matchCount}</p>
              <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Programs</p>
            </button>
            <div
              className="rounded-lg p-2 text-center"
              style={{ backgroundColor: '#ffffff', border: `1px solid ${BRAND_COLORS.borderLight}` }}
            >
              <p className="text-lg font-bold" style={{ color: programColor }}>{alerts.data?.urgent_count || 0}</p>
              <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Alerts</p>
            </div>
            <div
              className="rounded-lg p-2 text-center"
              style={{ backgroundColor: '#ffffff', border: `1px solid ${BRAND_COLORS.borderLight}` }}
            >
              <p className="text-lg font-bold" style={{ color: programColor }}>{reachPrograms.length + targetPrograms.length + safetyPrograms.length || '—'}</p>
              <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>Portfolio</p>
            </div>
          </div>

          {/* Expanded Programs View */}
          {showPrograms && allPrograms.length > 0 && (
            <div
              className="rounded-lg p-3 max-h-52 overflow-y-auto"
              style={{ backgroundColor: programBg, border: `1px solid ${programColor}40` }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: programColor }}>Matched Programs</p>
              <div className="space-y-2">
                {allPrograms.slice(0, 8).map((program: { name?: string; organization?: string; description?: string; type?: string; fit_score?: number; deadline?: string }, i: number) => (
                  <div
                    key={i}
                    className="rounded p-2 text-sm"
                    style={{ backgroundColor: '#ffffff', border: `1px solid ${BRAND_COLORS.borderLight}` }}
                  >
                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: programColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium" style={{ color: BRAND_COLORS.textHeading }}>{program.name}</p>
                        {program.organization && <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>{program.organization}</p>}
                        {program.description && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: BRAND_COLORS.textMuted }}>{program.description}</p>}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {program.type && (
                            <span
                              className="px-1.5 py-0.5 rounded text-xs"
                              style={{ backgroundColor: programBg, color: programColor }}
                            >
                              {program.type}
                            </span>
                          )}
                          {program.fit_score !== undefined && (
                            <span
                              className="px-1.5 py-0.5 rounded text-xs"
                              style={{ backgroundColor: BRAND_COLORS.bgSuccess, color: BRAND_COLORS.success }}
                            >
                              {Math.round(program.fit_score * 100)}% fit
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {allPrograms.length > 8 && (
                  <p className="text-xs text-center pt-1" style={{ color: BRAND_COLORS.textMuted }}>+{allPrograms.length - 8} more programs</p>
                )}
              </div>
            </div>
          )}

          {/* Alerts */}
          {alerts.data?.alerts && alerts.data.alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.data.alerts.slice(0, 2).map((alert: { urgency?: string; opportunity_name?: string; months_remaining?: number }, i: number) => (
                <div
                  key={i}
                  className="rounded-lg p-2 text-sm"
                  style={{
                    backgroundColor: alert.urgency === 'URGENT' ? BRAND_COLORS.bgError : BRAND_COLORS.infoBg,
                    color: alert.urgency === 'URGENT' ? BRAND_COLORS.error : BRAND_COLORS.info,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">{alert.opportunity_name}</span>
                    <span className="ml-auto text-xs">{alert.months_remaining}mo left</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Strategic Insights from Programs */}
          {programs?.strategic_insights && (programs.strategic_insights as string[]).length > 0 && (
            <div
              className="rounded p-2"
              style={{ backgroundColor: programBg, border: `1px solid ${programColor}40` }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: programColor }}>Program Strategy</p>
              <p className="text-xs line-clamp-2" style={{ color: BRAND_COLORS.textSecondary }}>{(programs.strategic_insights as string[])[0]}</p>
            </div>
          )}
        </div>
      ) : <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Loading programs...</p>}
    </AgentCard>
  );
}

export function MultiAgentTab({ profileId }: MultiAgentTabProps) {
  const health = useAgentHealth();
  const v2Health = useAgentV2Health();
  const { refetchAll, isLoading } = useDashboardData(profileId);
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  // Agent detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalAgent, setDetailModalAgent] = useState<AgentType>('assessment');
  const [detailModalTitle, setDetailModalTitle] = useState('');
  const [detailModalData, setDetailModalData] = useState<Record<string, unknown> | null>(null);

  const handleViewDetails = (agentType: AgentType, title: string, data: Record<string, unknown>) => {
    console.log('[MultiAgentTab] Opening detail modal for:', agentType, title);
    setDetailModalAgent(agentType);
    setDetailModalTitle(title);
    setDetailModalData(data);
    setDetailModalOpen(true);
  };

  // Get real profile data from store
  const profile = useStudentStore((s) => s.profile);

  // Build studentProfile for V2 components from real profile data
  const studentProfile = {
    spike: profile.passion?.spike_category || 'general',
    identity: [
      profile.passion?.brag_text,
      profile.intended_major,
      profile.identity?.name,
    ].filter(Boolean) as string[],
    activities: [
      profile.passion?.project_description && {
        name: 'Main Project',
        description: profile.passion.project_description,
      },
      ...(profile.aptitude?.academic_awards || []).map((award) => ({
        name: award,
        description: 'Academic award',
      })),
      ...(profile.passion?.ec_awards || []).map((award) => ({
        name: award,
        description: 'Extracurricular award',
      })),
    ].filter(Boolean) as Array<{ name: string; description?: string }>,
    has_working_project: Boolean(
      profile.passion?.project_description &&
      profile.passion.project_description.length > 20
    ),
  };

  if (!profileId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Brain className="w-12 h-12 mb-4" style={{ color: BRAND_COLORS.borderLight }} />
        <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.textSecondary }}>No Profile Selected</h3>
        <p style={{ color: BRAND_COLORS.textMuted }}>Complete your assessment to see multi-agent insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* v2.0 Backend Status */}
      <div
        className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg"
        style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
      >
        <div
          className={`w-2 h-2 rounded-full ${v2Health.isLoading ? 'animate-pulse' : ''}`}
          style={{
            backgroundColor: v2Health.data?.status === 'healthy'
              ? BRAND_COLORS.success
              : v2Health.isLoading
                ? BRAND_COLORS.warning
                : BRAND_COLORS.error
          }}
        />
        <span className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
          v2.0 Backend: {v2Health.data?.status || (v2Health.isLoading ? 'connecting...' : 'offline')}
        </span>
        {v2Health.data?.version && (
          <span className="text-xs ml-2" style={{ color: BRAND_COLORS.textMuted }}>({v2Health.data.version})</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: BRAND_COLORS.textHeading }}>Multi-Agent Dashboard</h2>
          <p style={{ color: BRAND_COLORS.textMuted }}>Your 6-agent coaching team working in parallel</p>
        </div>
        <div className="flex items-center gap-3">
          {health.data && (
            <span
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
              style={{ backgroundColor: BRAND_COLORS.bgSuccess, color: BRAND_COLORS.success }}
            >
              <Activity className="w-4 h-4" />
              Backend {health.data.status}
            </span>
          )}
          <button
            onClick={() => setShowCrisisModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: BRAND_COLORS.primary, color: '#ffffff' }}
          >
            <Flame className="w-4 h-4" />
            Crisis Help
          </button>
          <button
            onClick={refetchAll}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: BRAND_COLORS.secondary, color: '#ffffff' }}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh All
          </button>
        </div>
      </div>

      {/* v2.0 Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeAuditCardV2 />
        <AwardsPortfolioCardV2 studentProfile={studentProfile} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AssessmentSection profileId={profileId} onViewDetails={(data) => handleViewDetails('assessment', 'Assessment Agent - Narrative DNA', data)} />
        <ECAgentSection profileId={profileId} onViewDetails={(data) => handleViewDetails('ec', 'EC Agent - Identity Synthesis', data)} />
        <GamePlanSection profileId={profileId} onViewDetails={(data) => handleViewDetails('gameplan', 'Game Plan Agent - Strategic Roadmap', data)} />
        <ExecutionSection profileId={profileId} onViewDetails={(data) => handleViewDetails('execution', 'Execution Agent - Progress Tracking', data)} />
        <AwardsSection profileId={profileId} onViewDetails={(data) => handleViewDetails('awards', 'Awards Agent - Portfolio Analysis', data)} />
        <OpportunitiesSection profileId={profileId} onViewDetails={(data) => handleViewDetails('opportunity', 'Programs Agent - Matches & Deadlines', data)} />
      </div>

      {/* Crisis Alchemy Modal */}
      <CrisisAlchemyModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        studentProfile={studentProfile}
      />

      {/* Agent Detail Modal */}
      <AgentDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        agentType={detailModalAgent}
        title={detailModalTitle}
        data={detailModalData}
      />
    </div>
  );
}

export default MultiAgentTab;
