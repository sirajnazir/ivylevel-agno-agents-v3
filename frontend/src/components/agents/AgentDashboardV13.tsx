/**
 * AgentDashboard Component
 * v15.0 - Multi-Agent Dashboard with 6 agent cards in responsive grid
 *
 * Layout: 2x3 grid on desktop, stacked on mobile
 * Features:
 * - Health indicator with version display
 * - Refresh all button
 * - 6 agent cards with real-time data
 * - Clickable cards opening detail modals (v15.0)
 * - Chat view toggle (optional)
 */
'use client';

import { useState, useCallback } from 'react';
import { RefreshCw, Brain, Activity } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { useAgentV13Health, useDashboardV13Data } from '@/hooks/useAgentData';
import {
  AssessmentAgentCard,
  ECAgentCard,
  GamePlanAgentCard,
  ExecutionAgentCard,
  AwardsAgentCard,
  OpportunityAgentCard,
  CrisisAgentCard,
} from './cards';
import { AgentDetailModal, AgentType } from './AgentDetailModal';

interface AgentDashboardV13Props {
  profileId: string | null;
  onAgentChat?: (agentType: string) => void;
}

export function AgentDashboardV13({ profileId, onAgentChat }: AgentDashboardV13Props) {
  const { data: health, isLoading: healthLoading } = useAgentV13Health();
  const { isLoading, refetchAll } = useDashboardV13Data(profileId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAgentType, setModalAgentType] = useState<AgentType>('assessment');
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState<Record<string, unknown> | null>(null);

  const handleViewDetails = useCallback((agentType: AgentType, title: string, data: Record<string, unknown>) => {
    console.log('[AgentDashboard] Card clicked!', { agentType, title, dataKeys: Object.keys(data || {}) });
    setModalAgentType(agentType);
    setModalTitle(title);
    setModalData(data);
    setModalOpen(true);
    console.log('[AgentDashboard] Modal should now be open');
  }, []);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    refetchAll();
    // Add small delay for visual feedback
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleAgentChat = (agentType: string) => {
    if (onAgentChat) {
      onAgentChat(agentType);
    }
  };

  // No profileId - show onboarding state
  if (!profileId) {
    return (
      <div
        className="p-8 min-h-[400px] flex flex-col items-center justify-center"
        style={{ backgroundColor: BRAND_COLORS.bgPage }}
      >
        <div
          className="p-4 rounded-full mb-4"
          style={{ backgroundColor: BRAND_COLORS.primaryBg }}
        >
          <Brain size={48} style={{ color: BRAND_COLORS.primary }} />
        </div>
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: BRAND_COLORS.textHeading }}
        >
          Complete Your Assessment
        </h2>
        <p
          className="text-center max-w-md"
          style={{ color: BRAND_COLORS.textMuted }}
        >
          Finish the IvyQuest assessment to unlock your personalized multi-agent
          coaching team. Your 6 AI agents will provide continuous strategic guidance.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: BRAND_COLORS.bgPage }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: BRAND_COLORS.textHeading }}
          >
            Multi-Agent Dashboard
          </h1>
          <p style={{ color: BRAND_COLORS.textMuted }} className="text-sm">
            Your 6-agent coaching team working in parallel
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Health Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${healthLoading
                  ? 'bg-yellow-500 animate-pulse'
                  : health?.status === 'healthy'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
            />
            <span style={{ color: BRAND_COLORS.textMuted }} className="text-sm">
              {healthLoading
                ? 'Connecting...'
                : health?.status === 'healthy'
                  ? 'Backend healthy'
                  : 'Backend unavailable'}
            </span>
          </div>

          {/* Refresh All Button */}
          <button
            onClick={handleRefreshAll}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: BRAND_COLORS.primaryBg,
              color: BRAND_COLORS.primary,
              border: `1px solid ${BRAND_COLORS.primary}`,
            }}
          >
            <RefreshCw
              size={16}
              className={isLoading || isRefreshing ? 'animate-spin' : ''}
            />
            Refresh All
          </button>
        </div>
      </div>

      {/* Version Badge */}
      {health && (
        <div className="flex items-center gap-2 text-xs" style={{ color: BRAND_COLORS.textMuted }}>
          <Activity size={12} />
          <span>
            v{health.version || '15.0'} •
            ReAct: {health.react_enabled ? 'On' : 'Off'} •
            Memory: {health.memory_enabled ? 'On' : 'Off'} •
            HITL: {health.hitl_enabled ? 'On' : 'Off'}
          </span>
        </div>
      )}

      {/* Agent Grid - 2x3 on desktop, 1 column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AssessmentAgentCard
          profileId={profileId}
          onChat={() => handleAgentChat('narrative')}
          onViewDetails={(data) => handleViewDetails('assessment', 'Assessment Agent - Narrative DNA', data)}
        />
        <ECAgentCard
          profileId={profileId}
          onChat={() => handleAgentChat('strategist')}
          onViewDetails={(data) => handleViewDetails('ec', 'EC Agent - Identity Synthesis', data)}
        />
        <GamePlanAgentCard
          profileId={profileId}
          onChat={() => handleAgentChat('strategist')}
          onViewDetails={(data) => handleViewDetails('gameplan', 'Game Plan Agent - Strategic Roadmap', data)}
        />
        <ExecutionAgentCard
          profileId={profileId}
          onChat={() => handleAgentChat('strategist')}
          onViewDetails={(data) => handleViewDetails('execution', 'Execution Agent - Progress Tracking', data)}
        />
        <AwardsAgentCard
          profileId={profileId}
          onChat={() => handleAgentChat('awards')}
          onViewDetails={(data) => handleViewDetails('awards', 'Awards Agent - Portfolio Analysis', data)}
        />
        <OpportunityAgentCard
          profileId={profileId}
          onChat={() => handleAgentChat('opportunity')}
          onViewDetails={(data) => handleViewDetails('opportunity', 'Opportunity Agent - Matches & Deadlines', data)}
        />
        <CrisisAgentCard
          profileId={profileId}
          onViewDetails={(data) => handleViewDetails('crisis', 'Crisis Response - VARC Framework', data)}
        />
      </div>

      {/* Detail Modal */}
      <AgentDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        agentType={modalAgentType}
        title={modalTitle}
        data={modalData}
      />

      {/* Thresholds Info (Development) */}
      {health?.thresholds && process.env.NODE_ENV === 'development' && (
        <div
          className="p-3 rounded-lg text-xs"
          style={{
            backgroundColor: BRAND_COLORS.bgSecondary,
            color: BRAND_COLORS.textMuted,
          }}
        >
          <p className="font-medium mb-1">Quality Thresholds (Dev)</p>
          <p>
            MIN_QUALITY: {health.thresholds.min_quality} |
            MIN_VOICE: {health.thresholds.min_voice} |
            MIN_GOLDEN: {health.thresholds.min_golden} |
            MAX_CYCLES: {health.thresholds.max_cycles}
          </p>
        </div>
      )}
    </div>
  );
}

export default AgentDashboardV13;
