// Multi-Agent Dashboard Tab
// File: components/dashboard/MultiAgentTab.tsx

'use client';

import React, { useState } from 'react';
import { Brain, Map, Zap, Award, Compass, RefreshCw, AlertCircle, CheckCircle, Loader2, ChevronRight, ChevronDown, Activity, Clock, Flame, User, Target, Sparkles, TreeDeciduous, Lightbulb, GraduationCap } from 'lucide-react';
import { NarrativeDNACard } from '@/components/agents/NarrativeDNACard';
import {
  useAssessmentEnhancement,
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
  icon: React.ElementType;
  color: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  onClick?: () => void;
}

function AgentCard({ name, icon: Icon, color, status, error, children, onRefresh, onClick }: AgentCardProps) {
  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', icon: 'bg-teal-100 dark:bg-teal-800 text-teal-600 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  };
  const colors = colorClasses[color] || colorClasses.purple;
  const isClickable = !!onClick && status !== 'loading' && status !== 'error';

  return (
    <div
      className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden ${isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all' : ''}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colors.icon}`}><Icon className="w-5 h-5" /></div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {status === 'loading' && <span className="flex items-center gap-1 text-xs text-blue-600"><Loader2 className="w-3 h-3 animate-spin" />Processing...</span>}
                {status === 'success' && <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3 h-3" />Ready</span>}
                {status === 'error' && <span className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="w-3 h-3" />Error</span>}
              </div>
            </div>
          </div>
          {onRefresh && (
            <button onClick={(e) => { e.stopPropagation(); onRefresh(); }} disabled={status === 'loading'} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 text-gray-500 ${status === 'loading' ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        {status === 'error' && error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : children}
      </div>
      {/* Click hint for clickable cards */}
      {isClickable && (
        <div className="px-4 pb-3 pt-1 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-400">Click for details →</span>
        </div>
      )}
    </div>
  );
}

function AssessmentSection({ profileId, onViewDetails }: { profileId: string; onViewDetails?: (data: Record<string, unknown>) => void }) {
  // HYBRID APPROACH: Database (Four Pillars, Brand Statement) + Agno API (CRI, real-time)
  const { data: identity, isLoading: identityLoading } = useProfileIdentity(profileId);
  const { data: agnoData, isLoading: agnoLoading, isError, error, refetch } = useAssessmentEnhancement(profileId);

  // DEBUG: Log what we're getting from each source
  console.log('[AssessmentSection] profileId:', profileId);
  console.log('[AssessmentSection] identity from useProfileIdentity:', identity);
  console.log('[AssessmentSection] agnoData from useAssessmentEnhancement:', agnoData);

  const isLoading = identityLoading && agnoLoading;
  const hasData = identity || agnoData;

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

  // DEBUG: Log merged values
  console.log('[AssessmentSection] Merged data:', { brandStatement, narrativeDna, pillars, themes, spike, archetypeName, archetypeV2 });

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
    ...agnoData,
  };

  return (
    <AgentCard
      name="Assessment Agent"
      icon={Brain}
      color="purple"
      status={isLoading ? 'loading' : isError ? 'error' : hasData ? 'success' : 'idle'}
      error={error?.message}
      onRefresh={() => refetch()}
      onClick={hasData && onViewDetails ? () => onViewDetails(combinedData as Record<string, unknown>) : undefined}
    >
      {hasData ? (
        <div className="space-y-3">
          {/* Brand Statement - Primary Display (North Star) */}
          {brandStatement && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Brand Statement</p>
              <p className="text-sm italic text-gray-700 dark:text-gray-300 line-clamp-3">"{brandStatement}"</p>
            </div>
          )}

          {/* Four Pillars Display */}
          {pillars.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Identity Pillars</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pillars.slice(0, 4).map((pillar, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs">
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
              {themes.slice(0, 3).map((theme, i) => (
                <span key={i} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                  {theme}
                </span>
              ))}
            </div>
          )}

          {/* Archetype - Enhanced with V2 Data */}
          {archetypeName && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Archetype</span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                  {archetypeName}
                </span>
              </div>
              {archetypeConfidence > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${archetypeConfidence * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{Math.round(archetypeConfidence * 100)}%</span>
                </div>
              )}
              {/* V2: Composite Code */}
              {compositeCode && (
                <div className="mt-2">
                  <span className="text-xs text-gray-400 font-mono">{compositeCode}</span>
                </div>
              )}
              {/* V2: Execution Style */}
              {executionStyle && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Execution:</span>
                  <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs">
                    {executionStyle.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* V2: Diversity Angles - Strategic Positioning */}
          {diversityAngles.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Diversity Angles</span>
                {isUrm && <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded text-xs">URM</span>}
                {isFirstGen && <span className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300 rounded text-xs">First-Gen</span>}
              </div>
              <div className="flex flex-wrap gap-1">
                {diversityAngles.map((angle: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs border border-green-200 dark:border-green-700">
                    {angle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CRI from Agno */}
          {cri > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Context Relativity Index</span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{cri.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      ) : <p className="text-sm text-gray-500">Loading assessment data...</p>}
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
      icon={User}
      color="purple"
      status={isLoading ? 'loading' : isError ? 'error' : identity ? 'success' : 'idle'}
      error={error?.message}
      onRefresh={() => refetch()}
      onClick={identity && onViewDetails ? () => onViewDetails({ identity_synthesis: identity, portfolio_analysis: portfolio, ...data }) : undefined}
    >
      {identity ? (
        <div className="space-y-4">
          {/* Archetype */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Archetype</span>
              </div>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                {String(identity.archetype || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            {identity.archetype_confidence && (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${Number(identity.archetype_confidence) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500">{Math.round(Number(identity.archetype_confidence) * 100)}%</span>
              </div>
            )}
          </div>

          {/* Spike */}
          {identity.spike && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Spike</span>
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                {String(identity.spike).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              {identity.spike_evidence && Array.isArray(identity.spike_evidence) && identity.spike_evidence.length > 0 && (
                <div className="mt-2 space-y-1">
                  {(identity.spike_evidence as string[]).slice(0, 2).map((ev, i) => (
                    <p key={i} className="text-xs text-gray-500 flex items-start gap-1">
                      <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {ev}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pillars */}
          {identity.pillars && Array.isArray(identity.pillars) && (identity.pillars as string[]).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Identity Pillars</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(identity.pillars as string[]).map((pillar, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                    {typeof pillar === 'object'
                      ? ((pillar as any).name || (pillar as any).label || JSON.stringify(pillar))
                      : String(pillar)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Summary */}
          {portfolio && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio Analysis</span>
              </div>
              {portfolio.strengths && Array.isArray(portfolio.strengths) && (portfolio.strengths as string[]).length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Strengths:</p>
                  <div className="flex flex-wrap gap-1">
                    {(portfolio.strengths as string[]).slice(0, 3).map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {portfolio.gaps && Array.isArray(portfolio.gaps) && (portfolio.gaps as string[]).length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Gaps:</p>
                  <div className="flex flex-wrap gap-1">
                    {(portfolio.gaps as string[]).slice(0, 3).map((g, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">{g}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : <p className="text-sm text-gray-500">Loading EC analysis...</p>}
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
      icon={Map}
      color="blue"
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
              onClick={() => toggleSection('activities')}
              className={`bg-white dark:bg-gray-800 rounded-lg p-3 border text-center transition-all hover:border-blue-300 ${expandedSection === 'activities' ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <p className="text-2xl font-bold text-blue-600">{data.game_plan.activities?.length || 0}</p>
              <p className="text-xs text-gray-500">Activities</p>
            </button>
            <button
              onClick={() => toggleSection('seeds')}
              className={`bg-white dark:bg-gray-800 rounded-lg p-3 border text-center transition-all hover:border-blue-300 ${expandedSection === 'seeds' ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <p className="text-2xl font-bold text-blue-600">{data.game_plan.identity_seeds?.length || 0}</p>
              <p className="text-xs text-gray-500">Seeds</p>
            </button>
          </div>

          {/* Expanded Activities View */}
          {expandedSection === 'activities' && data.game_plan.activities && (data.game_plan.activities as unknown[]).length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 max-h-64 overflow-y-auto">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">All Activities</p>
              <div className="space-y-2">
                {(data.game_plan.activities as Array<{ type?: string; name?: string; description?: string; category?: string; touchpoints?: string[] }>).map((activity, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded p-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Activity className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{activity.name || `Activity ${i + 1}`}</p>
                        {activity.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{activity.description}</p>}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {activity.type && <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">{activity.type}</span>}
                          {activity.category && <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs">{activity.category}</span>}
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
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800 max-h-64 overflow-y-auto">
              <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2">Identity Seeds</p>
              <div className="space-y-2">
                {(data.game_plan.identity_seeds as Array<{ type?: string; name?: string; description?: string; planted?: boolean; confidence?: number; evidence?: string[] }>).map((seed, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded p-2 text-sm">
                    <div className="flex items-start gap-2">
                      <TreeDeciduous className={`w-4 h-4 mt-0.5 flex-shrink-0 ${seed.planted ? 'text-green-500' : 'text-orange-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{seed.name}</p>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${seed.planted ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {seed.planted ? 'Planted' : 'Opportunity'}
                          </span>
                        </div>
                        {seed.description && <p className="text-xs text-gray-500 mt-0.5">{seed.description}</p>}
                        {seed.confidence && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                              <div className="bg-green-500 h-1 rounded-full" style={{ width: `${seed.confidence * 100}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{Math.round(seed.confidence * 100)}%</span>
                          </div>
                        )}
                        {seed.evidence && seed.evidence.length > 0 && (
                          <div className="mt-1">
                            {seed.evidence.slice(0, 2).map((ev, j) => (
                              <p key={j} className="text-xs text-gray-400 flex items-start gap-1">
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
                className={`w-full flex items-center justify-between p-2 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${expandedSection === 'phases' ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {(data.game_plan.phases as unknown[]).length} Strategic Phases
                </span>
                {expandedSection === 'phases' ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Collapsed Phase Summary */}
              {expandedSection !== 'phases' && (
                <div className="space-y-1 mt-1">
                  {(data.game_plan.phases as Array<{ name?: string; activity_count?: number }>).slice(0, 3).map((phase, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pl-2">
                      <ChevronRight className="w-3 h-3 text-blue-500" />
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
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-blue-100 text-blue-700' : i === 1 ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                            {i + 1}
                          </div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{phase.name}</span>
                        </div>
                        {phase.duration && <span className="text-xs text-gray-500">{phase.duration}</span>}
                      </div>
                      {phase.focus && <p className="text-xs text-gray-500 mb-2">{phase.focus}</p>}
                      {phase.activities && phase.activities.length > 0 && (
                        <div className="space-y-1">
                          {phase.activities.map((act, j) => (
                            <div key={j} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Activity className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                              <div>
                                <span className="font-medium">{act.name}</span>
                                {act.description && <span className="text-gray-400"> - {act.description}</span>}
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
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">Key Insights</p>
              <ul className="space-y-1">
                {(data.game_plan.strategic_insights as string[]).slice(0, 2).map((insight, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                    <Lightbulb className="w-3 h-3 mt-0.5 text-amber-500 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : <p className="text-sm text-gray-500">Loading game plan...</p>}
    </AgentCard>
  );
}

function ExecutionSection({ profileId, onViewDetails }: { profileId: string; onViewDetails?: (data: Record<string, unknown>) => void }) {
  const { data: eds, isLoading, isError, error, refetch } = useExecutionDebtScore(profileId);
  const statusColors: Record<string, string> = {
    healthy: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    at_risk: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <AgentCard
      name="Execution Agent"
      icon={Zap}
      color="green"
      status={isLoading ? 'loading' : isError ? 'error' : eds ? 'success' : 'idle'}
      error={error?.message}
      onRefresh={() => refetch()}
      onClick={eds && onViewDetails ? () => onViewDetails(eds as Record<string, unknown>) : undefined}
    >
      {eds ? (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Execution Debt Score</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[eds.status] || statusColors.healthy}`}>{eds.status.replace('_', ' ')}</span>
            </div>
            <div className="flex items-end gap-4">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">{Math.round(eds.execution_debt_score)}</div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${eds.status === 'healthy' ? 'bg-green-500' : eds.status === 'at_risk' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (eds.execution_debt_score / 100) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : <p className="text-sm text-gray-500">Loading execution data...</p>}
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

  return (
    <AgentCard
      name="Awards Agent"
      icon={Award}
      color="amber"
      status={isLoading ? 'loading' : isError ? 'error' : data ? 'success' : 'idle'}
      error={error?.message}
      onRefresh={() => refetch()}
      onClick={data && onViewDetails ? () => onViewDetails(data as Record<string, unknown>) : undefined}
    >
      {portfolio ? (
        <div className="space-y-3">
          {/* Summary - Clickable */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setExpandedCategory(expandedCategory === 'reach' ? null : 'reach')}
              className={`rounded-lg p-2 text-center transition-all hover:ring-1 hover:ring-orange-300 ${expandedCategory === 'reach' ? 'ring-2 ring-orange-400 bg-orange-100 dark:bg-orange-900/40' : 'bg-orange-50 dark:bg-orange-900/30'}`}
            >
              <p className="text-lg font-bold text-orange-600">{reachCount}</p>
              <p className="text-xs text-gray-500">Reach</p>
            </button>
            <button
              onClick={() => setExpandedCategory(expandedCategory === 'target' ? null : 'target')}
              className={`rounded-lg p-2 text-center transition-all hover:ring-1 hover:ring-yellow-300 ${expandedCategory === 'target' ? 'ring-2 ring-yellow-400 bg-yellow-100 dark:bg-yellow-900/40' : 'bg-yellow-50 dark:bg-yellow-900/30'}`}
            >
              <p className="text-lg font-bold text-yellow-600">{targetCount}</p>
              <p className="text-xs text-gray-500">Target</p>
            </button>
            <button
              onClick={() => setExpandedCategory(expandedCategory === 'safety' ? null : 'safety')}
              className={`rounded-lg p-2 text-center transition-all hover:ring-1 hover:ring-green-300 ${expandedCategory === 'safety' ? 'ring-2 ring-green-400 bg-green-100 dark:bg-green-900/40' : 'bg-green-50 dark:bg-green-900/30'}`}
            >
              <p className="text-lg font-bold text-green-600">{safetyCount}</p>
              <p className="text-xs text-gray-500">Safety</p>
            </button>
          </div>

          {/* Expanded Awards View */}
          {expandedCategory && getAwardsForCategory(expandedCategory).length > 0 && (
            <div className={`rounded-lg p-3 border max-h-48 overflow-y-auto ${expandedCategory === 'reach' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
              expandedCategory === 'target' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }`}>
              <p className={`text-xs font-medium mb-2 ${expandedCategory === 'reach' ? 'text-orange-700 dark:text-orange-300' :
                expandedCategory === 'target' ? 'text-yellow-700 dark:text-yellow-300' :
                  'text-green-700 dark:text-green-300'
                }`}>
                {expandedCategory.charAt(0).toUpperCase() + expandedCategory.slice(1)} Awards
              </p>
              <div className="space-y-2">
                {getAwardsForCategory(expandedCategory).map((award: { name?: string; organization?: string; description?: string; selectivity?: number; deadline?: string; fit_score?: number }, i: number) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded p-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Award className={`w-4 h-4 mt-0.5 flex-shrink-0 ${expandedCategory === 'reach' ? 'text-orange-500' :
                        expandedCategory === 'target' ? 'text-yellow-500' : 'text-green-500'
                        }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{award.name}</p>
                        {award.organization && <p className="text-xs text-gray-500">{award.organization}</p>}
                        {award.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{award.description}</p>}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {award.selectivity !== undefined && (
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                              {Math.round(award.selectivity * 100)}% sel.
                            </span>
                          )}
                          {award.fit_score !== undefined && (
                            <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded text-xs">
                              {Math.round(award.fit_score * 100)}% fit
                            </span>
                          )}
                          {award.deadline && (
                            <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-lg font-bold text-amber-600">{totalCount}</p>
              <p className="text-xs text-gray-500">Total Matched</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-lg font-bold text-amber-600">{portfolio.expected_wins?.toFixed(1) || '~'}</p>
              <p className="text-xs text-gray-500">Expected Wins</p>
            </div>
          </div>
        </div>
      ) : <p className="text-sm text-gray-500">Loading award matches...</p>}
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

  return (
    <AgentCard
      name="Programs Agent"
      icon={GraduationCap}
      color="teal"
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
              className={`bg-white dark:bg-gray-800 rounded-lg p-2 border text-center transition-all hover:border-teal-300 ${showPrograms ? 'border-teal-500 ring-1 ring-teal-200' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <p className="text-lg font-bold text-teal-600">{matchCount}</p>
              <p className="text-xs text-gray-500">Programs</p>
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-lg font-bold text-teal-600">{alerts.data?.urgent_count || 0}</p>
              <p className="text-xs text-gray-500">Alerts</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-lg font-bold text-teal-600">{reachPrograms.length + targetPrograms.length + safetyPrograms.length || '—'}</p>
              <p className="text-xs text-gray-500">Portfolio</p>
            </div>
          </div>

          {/* Expanded Programs View */}
          {showPrograms && allPrograms.length > 0 && (
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 border border-teal-200 dark:border-teal-800 max-h-52 overflow-y-auto">
              <p className="text-xs font-medium text-teal-700 dark:text-teal-300 mb-2">Matched Programs</p>
              <div className="space-y-2">
                {allPrograms.slice(0, 8).map((program: { name?: string; organization?: string; description?: string; type?: string; fit_score?: number; deadline?: string }, i: number) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded p-2 text-sm">
                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-4 h-4 mt-0.5 text-teal-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{program.name}</p>
                        {program.organization && <p className="text-xs text-gray-500">{program.organization}</p>}
                        {program.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{program.description}</p>}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {program.type && (
                            <span className="px-1.5 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded text-xs">
                              {program.type}
                            </span>
                          )}
                          {program.fit_score !== undefined && (
                            <span className="px-1.5 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs">
                              {Math.round(program.fit_score * 100)}% fit
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {allPrograms.length > 8 && (
                  <p className="text-xs text-gray-500 text-center pt-1">+{allPrograms.length - 8} more programs</p>
                )}
              </div>
            </div>
          )}

          {/* Alerts */}
          {alerts.data?.alerts && alerts.data.alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.data.alerts.slice(0, 2).map((alert: { urgency?: string; opportunity_name?: string; months_remaining?: number }, i: number) => (
                <div key={i} className={`rounded-lg p-2 text-sm ${alert.urgency === 'URGENT' ? 'bg-red-50 dark:bg-red-900/30 text-red-700' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700'}`}>
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
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded p-2 border border-teal-200 dark:border-teal-800">
              <p className="text-xs font-medium text-teal-700 dark:text-teal-300 mb-1">Program Strategy</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{(programs.strategic_insights as string[])[0]}</p>
            </div>
          )}
        </div>
      ) : <p className="text-sm text-gray-500">Loading programs...</p>}
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
        <Brain className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Profile Selected</h3>
        <p className="text-gray-500 dark:text-gray-400">Complete your assessment to see multi-agent insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* v2.0 Backend Status */}
      <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className={`w-2 h-2 rounded-full ${v2Health.data?.status === 'healthy' ? 'bg-green-500' :
          v2Health.isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
          }`} />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          v2.0 Backend: {v2Health.data?.status || (v2Health.isLoading ? 'connecting...' : 'offline')}
        </span>
        {v2Health.data?.version && (
          <span className="text-xs text-gray-400 ml-2">({v2Health.data.version})</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Agent Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">Your 6-agent coaching team working in parallel</p>
        </div>
        <div className="flex items-center gap-3">
          {health.data && (
            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">
              <Activity className="w-4 h-4" />
              Backend {health.data.status}
            </span>
          )}
          <button
            onClick={() => setShowCrisisModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            <Flame className="w-4 h-4" />
            Crisis Help
          </button>
          <button onClick={refetchAll} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
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
