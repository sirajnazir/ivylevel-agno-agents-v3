/**
 * MultiAgentsTab - Multi-Agent Chat Interface + v13.3 Dashboard
 * v14.0 - CrewAI-powered multi-agent chat with personalities
 * v13.3 - 6-agent dashboard with ReAct, Memory, HITL integration
 */
'use client';

import { useState, useEffect } from 'react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { getSupabaseClient } from '@/lib/supabase/client';

// v14.0: CrewAI Multi-Agent Chat
import { MultiAgentChat } from '@/components/agents/MultiAgentChat';

// v13.3 Components
import { AgentDashboardV13 } from '@/components/agents/AgentDashboardV13';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { useProfileId, useIsAssessmentComplete, useSessionStore } from '@/lib/store/useSessionStore';

export function MultiAgentsTab() {
  const [activeView, setActiveView] = useState<'dashboard' | 'chat'>('dashboard');
  const profileId = useProfileId();
  const isAssessmentComplete = useIsAssessmentComplete();
  const { setProfileId, session_id } = useSessionStore();

  // Retroactively set profile_id if assessment is complete but profile_id is missing
  useEffect(() => {
    const setAuthProfileId = async () => {
      if (isAssessmentComplete && !profileId) {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          setProfileId(user.id);
        } else if (session_id) {
          setProfileId(session_id);
        }
      }
    };
    setAuthProfileId();
  }, [isAssessmentComplete, profileId, session_id, setProfileId]);

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* v13.3 Header with View Toggle and Notifications */}
      <div
        className="border-b px-6 py-4"
        style={{ backgroundColor: BRAND_COLORS.bgPrimary, borderColor: BRAND_COLORS.borderLight }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold" style={{ color: BRAND_COLORS.textHeading }}>
              Multi-Agent Intelligence
            </h2>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: BRAND_COLORS.primaryBg, color: BRAND_COLORS.primary }}
            >
              v13.3
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NotificationBell profileId={profileId} />

            {/* View Toggle */}
            <div
              className="flex rounded-lg p-1"
              style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
            >
              <button
                onClick={() => setActiveView('dashboard')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeView === 'dashboard' ? BRAND_COLORS.bgPrimary : 'transparent',
                  color: activeView === 'dashboard' ? BRAND_COLORS.textHeading : BRAND_COLORS.textMuted,
                  boxShadow: activeView === 'dashboard' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('chat')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeView === 'chat' ? BRAND_COLORS.bgPrimary : 'transparent',
                  color: activeView === 'chat' ? BRAND_COLORS.textHeading : BRAND_COLORS.textMuted,
                  boxShadow: activeView === 'chat' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* v13.3 Dashboard View */}
      {activeView === 'dashboard' && (
        <AgentDashboardV13
          profileId={profileId}
          onAgentChat={(agentType) => {
            setActiveView('chat');
          }}
        />
      )}

      {/* v14.0 Multi-Agent Chat View */}
      {activeView === 'chat' && (
        <div className="p-4 max-w-4xl mx-auto" style={{ height: 'calc(100vh - 140px)' }}>
          <MultiAgentChat
            profileId={profileId}
            initialAgent="execution"
            height="100%"
          />
        </div>
      )}

    </div>
  );
}

export default MultiAgentsTab;
