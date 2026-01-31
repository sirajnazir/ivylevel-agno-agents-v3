/**
 * ExecutionTab - Execution Agent Hub with Dashboard + Chat
 * v5.3 - Integrated with ExecutionAgent backend
 *
 * Features:
 * - Dashboard view: EDS score, weekly focus, stalled projects, active projects
 * - Chat view: Real-time chat with Execution Agent
 * - Event bus integration for cross-tab notifications
 */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, Zap, AlertTriangle, CheckCircle2,
  Target, Clock, TrendingDown, Calendar, RefreshCw,
  ChevronRight, Sparkles, MessageSquare
} from 'lucide-react';
import { COLORS } from '@/lib/constants/design';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { useExecutionChat, type ChatMessage } from '@/hooks/useExecutionChat';
import { useProfileId, useSessionStore } from '@/lib/store/useSessionStore';
import { getSupabaseClient } from '@/lib/supabase/client';

// =====================================================
// Types
// =====================================================

interface EDSData {
  eds_score: number;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  active_projects: number;
  overdue_projects: number;
  stalled_projects: number;
}

interface WeeklyFocus {
  focus_items: Array<{
    project_id?: string;
    title: string;
    reason?: string;
  }>;
  week_start?: string;
  week_end?: string;
  total_p0?: number;
  total_p1?: number;
  total_p2?: number;
  message?: string;
}

interface StalledProject {
  id: string;
  title: string;
  status: string;
  days_since_activity: number;
  type?: string;
  severity: 'mild' | 'moderate' | 'severe';
  suggested_action: string;
}

interface ActiveProject {
  id: string;
  name?: string;
  title?: string;
  status: string;
  type?: string;
}

// =====================================================
// Main Component
// =====================================================

export function ExecutionTab() {
  const profileId = useProfileId();
  const { setProfileId, session_id } = useSessionStore();

  // Views
  const [activeView, setActiveView] = useState<'dashboard' | 'chat'>('dashboard');

  // Dashboard data
  const [edsData, setEdsData] = useState<EDSData | null>(null);
  const [weeklyFocus, setWeeklyFocus] = useState<WeeklyFocus | null>(null);
  const [stalledProjects, setStalledProjects] = useState<StalledProject[]>([]);
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [hasAttemptedAutoGenerate, setHasAttemptedAutoGenerate] = useState(false);

  // Chat
  const {
    messages,
    sendMessage,
    isStreaming,
    error: chatError,
    clearMessages,
    isLoadingHistory,
  } = useExecutionChat(profileId);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set profile ID from auth if needed
  useEffect(() => {
    const setAuthProfileId = async () => {
      if (!profileId) {
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
  }, [profileId, session_id, setProfileId]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!profileId) return;

    setIsLoadingDashboard(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_AGENTS_API_URL || 'http://localhost:8000';

      // Fetch all data in parallel
      const [edsRes, focusRes, stallsRes, projectsRes] = await Promise.all([
        fetch(`${backendUrl}/api/execution/eds/${profileId}`).catch(() => null),
        fetch(`${backendUrl}/api/execution/weekly-focus/${profileId}`).catch(() => null),
        fetch(`${backendUrl}/api/execution/stalls/${profileId}`).catch(() => null),
        fetch(`${backendUrl}/api/execution/projects/${profileId}`).catch(() => null),
      ]);

      if (edsRes?.ok) {
        const eds = await edsRes.json();
        setEdsData(eds);
      }

      if (focusRes?.ok) {
        const focus = await focusRes.json();
        setWeeklyFocus(focus);
      }

      if (stallsRes?.ok) {
        const stalls = await stallsRes.json();
        setStalledProjects(stalls);
      }

      if (projectsRes?.ok) {
        const projects = await projectsRes.json();
        setActiveProjects(projects);
      }
    } catch (err) {
      console.error('[ExecutionTab] Error loading dashboard:', err);
    } finally {
      setIsLoadingDashboard(false);
    }
  }, [profileId]);

  // v5.4: Generate weekly plan (auto or manual)
  const generateWeeklyPlan = useCallback(async () => {
    if (!profileId || isGeneratingPlan) return;

    setIsGeneratingPlan(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_AGENTS_API_URL || 'http://localhost:8000';
      console.log('[ExecutionTab] Generating weekly plan for:', profileId);

      const response = await fetch(`${backendUrl}/api/execution/weekly-plan/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[ExecutionTab] Weekly plan generated:', result);
        // Reload dashboard to show new plan
        await loadDashboardData();
      } else {
        console.error('[ExecutionTab] Failed to generate weekly plan:', response.status);
      }
    } catch (err) {
      console.error('[ExecutionTab] Error generating weekly plan:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  }, [profileId, isGeneratingPlan, loadDashboardData]);

  // Load data on mount
  useEffect(() => {
    if (profileId && activeView === 'dashboard') {
      loadDashboardData();
    }
  }, [profileId, activeView, loadDashboardData]);

  // v5.4: Auto-generate weekly plan if none exists (one-time attempt)
  useEffect(() => {
    if (
      profileId &&
      activeView === 'dashboard' &&
      !isLoadingDashboard &&
      !hasAttemptedAutoGenerate &&
      weeklyFocus &&
      weeklyFocus.focus_items?.length === 0 &&
      activeProjects.length > 0 // Only generate if we have projects
    ) {
      console.log('[ExecutionTab] No weekly plan found, auto-generating...');
      setHasAttemptedAutoGenerate(true);
      generateWeeklyPlan();
    }
  }, [profileId, activeView, isLoadingDashboard, hasAttemptedAutoGenerate, weeklyFocus, activeProjects, generateWeeklyPlan]);

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const message = input;
    setInput('');
    await sendMessage(message, { contextType: 'general' });
  };

  // Handle project click - switch to chat with context
  const handleProjectChat = (projectId: string, projectTitle: string) => {
    setActiveView('chat');
    // Send an initial message about the project
    sendMessage(`I want to discuss my project "${projectTitle}"`, {
      contextType: 'project',
      contextId: projectId,
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div
        className="border-b px-6 py-4"
        style={{ backgroundColor: BRAND_COLORS.bgPrimary, borderColor: BRAND_COLORS.borderLight }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.primaryBg }}
            >
              <Zap size={20} style={{ color: BRAND_COLORS.primary }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: BRAND_COLORS.textHeading }}>
                Execution Hub
              </h2>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Your coaching buddy for getting things done
              </p>
            </div>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: BRAND_COLORS.primaryBg, color: BRAND_COLORS.primary }}
            >
              v5.3
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh button */}
            {activeView === 'dashboard' && (
              <button
                onClick={loadDashboardData}
                disabled={isLoadingDashboard}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
              >
                <RefreshCw
                  size={18}
                  className={isLoadingDashboard ? 'animate-spin' : ''}
                  style={{ color: BRAND_COLORS.textMuted }}
                />
              </button>
            )}

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

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <DashboardView
          edsData={edsData}
          weeklyFocus={weeklyFocus}
          stalledProjects={stalledProjects}
          activeProjects={activeProjects}
          isLoading={isLoadingDashboard}
          isGeneratingPlan={isGeneratingPlan}
          onProjectChat={handleProjectChat}
          onSwitchToChat={() => setActiveView('chat')}
          onGeneratePlan={generateWeeklyPlan}
        />
      )}

      {/* Chat View */}
      {activeView === 'chat' && (
        <ChatView
          messages={messages}
          isStreaming={isStreaming}
          isLoadingHistory={isLoadingHistory}
          error={chatError}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onClear={clearMessages}
          messagesEndRef={messagesEndRef}
        />
      )}
    </div>
  );
}

// =====================================================
// Dashboard View Component
// =====================================================

interface DashboardViewProps {
  edsData: EDSData | null;
  weeklyFocus: WeeklyFocus | null;
  stalledProjects: StalledProject[];
  activeProjects: ActiveProject[];
  isLoading: boolean;
  isGeneratingPlan: boolean;
  onProjectChat: (projectId: string, title: string) => void;
  onSwitchToChat: () => void;
  onGeneratePlan: () => void;
}

function DashboardView({
  edsData,
  weeklyFocus,
  stalledProjects,
  activeProjects,
  isLoading,
  isGeneratingPlan,
  onProjectChat,
  onSwitchToChat,
  onGeneratePlan,
}: DashboardViewProps) {
  if (isLoading && !edsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin" style={{ color: BRAND_COLORS.primary }} />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8" style={{ backgroundColor: BRAND_COLORS.bgPage }}>
      {/* EDS Score + Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* EDS Score Card */}
        <EDSCard edsData={edsData} />

        {/* Quick Actions Card */}
        <div
          className="lg:col-span-2 rounded-xl p-6"
          style={{ backgroundColor: BRAND_COLORS.bgPrimary, border: `1px solid ${BRAND_COLORS.borderLight}` }}
        >
          <h3 className="font-semibold mb-4" style={{ color: BRAND_COLORS.textHeading }}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionButton
              icon={<MessageSquare size={20} />}
              label="Chat with Coach"
              description="Get help with execution"
              onClick={onSwitchToChat}
            />
            <QuickActionButton
              icon={<Target size={20} />}
              label="Review Focus"
              description="Check P0 priorities"
              onClick={() => { }}
            />
            <QuickActionButton
              icon={<AlertTriangle size={20} />}
              label="Handle Stalls"
              description={`${stalledProjects.length} projects need attention`}
              onClick={onSwitchToChat}
              highlight={stalledProjects.length > 0}
            />
            <QuickActionButton
              icon={isGeneratingPlan ? <Loader2 size={20} className="animate-spin" /> : <Calendar size={20} />}
              label={isGeneratingPlan ? 'Generating...' : 'Generate Plan'}
              description={isGeneratingPlan ? 'Creating weekly plan' : 'Create weekly plan'}
              onClick={onGeneratePlan}
              disabled={isGeneratingPlan}
            />
          </div>
        </div>
      </div>

      {/* Weekly Focus + Stalled Projects Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Focus Card */}
        <WeeklyFocusCard weeklyFocus={weeklyFocus} />

        {/* Stalled Projects Card */}
        <StalledProjectsCard
          projects={stalledProjects}
          onProjectChat={onProjectChat}
        />
      </div>

      {/* Active Projects */}
      <ActiveProjectsCard
        projects={activeProjects}
        onProjectChat={onProjectChat}
      />
    </main>
  );
}

// =====================================================
// EDS Card Component
// =====================================================

function EDSCard({ edsData }: { edsData: EDSData | null }) {
  const score = edsData?.eds_score ?? 0;
  const status = edsData?.status ?? 'unknown';

  const statusConfig = {
    healthy: { color: BRAND_COLORS.success, label: 'Healthy', icon: <CheckCircle2 size={20} /> },
    warning: { color: BRAND_COLORS.warning, label: 'Warning', icon: <AlertTriangle size={20} /> },
    critical: { color: BRAND_COLORS.error, label: 'Critical', icon: <AlertTriangle size={20} /> },
    unknown: { color: BRAND_COLORS.textMuted, label: 'Unknown', icon: <Clock size={20} /> },
  };

  const config = statusConfig[status];

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: BRAND_COLORS.bgPrimary, border: `1px solid ${BRAND_COLORS.borderLight}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
          Execution Debt Score
        </h3>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: `${config.color}15`, color: config.color }}
        >
          {config.icon}
          {config.label}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold" style={{ color: config.color }}>
          {score}
        </span>
        <span className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
          points
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: BRAND_COLORS.borderLight }}>
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
            {edsData?.active_projects ?? 0}
          </div>
          <div className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
            Active
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color: BRAND_COLORS.warning }}>
            {edsData?.overdue_projects ?? 0}
          </div>
          <div className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
            Overdue
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color: BRAND_COLORS.error }}>
            {edsData?.stalled_projects ?? 0}
          </div>
          <div className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
            Stalled
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Quick Action Button
// =====================================================

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  highlight?: boolean;
  disabled?: boolean;
}

function QuickActionButton({ icon, label, description, onClick, highlight, disabled }: QuickActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
      style={{
        backgroundColor: highlight ? BRAND_COLORS.primaryBg : BRAND_COLORS.bgSecondary,
        border: highlight ? `1px solid ${BRAND_COLORS.primary}` : `1px solid transparent`,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: highlight ? BRAND_COLORS.primary : BRAND_COLORS.bgPrimary,
          color: highlight ? 'white' : BRAND_COLORS.primary,
        }}
      >
        {icon}
      </div>
      <div>
        <div className="font-medium text-sm" style={{ color: BRAND_COLORS.textHeading }}>
          {label}
        </div>
        <div className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
          {description}
        </div>
      </div>
      <ChevronRight size={16} className="ml-auto" style={{ color: BRAND_COLORS.textMuted }} />
    </motion.button>
  );
}

// =====================================================
// Weekly Focus Card
// =====================================================

function WeeklyFocusCard({ weeklyFocus }: { weeklyFocus: WeeklyFocus | null }) {
  const focusItems = weeklyFocus?.focus_items || [];

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: BRAND_COLORS.bgPrimary, border: `1px solid ${BRAND_COLORS.borderLight}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
          Weekly Focus (P0)
        </h3>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{ backgroundColor: BRAND_COLORS.bgSecondary, color: BRAND_COLORS.textMuted }}
        >
          {focusItems.length} items
        </span>
      </div>

      {focusItems.length === 0 ? (
        <div className="text-center py-8">
          <Target size={32} className="mx-auto mb-2" style={{ color: BRAND_COLORS.textMuted }} />
          <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
            {weeklyFocus?.message || 'No weekly plan yet'}
          </p>
          <p className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
            Chat with your coach to generate one
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {focusItems.slice(0, 3).map((item, index) => (
            <div
              key={item.project_id || index}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: BRAND_COLORS.primary, color: 'white' }}
              >
                {index + 1}
              </div>
              <div>
                <div className="font-medium text-sm" style={{ color: BRAND_COLORS.textHeading }}>
                  {item.title}
                </div>
                {item.reason && (
                  <div className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
                    {item.reason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Stalled Projects Card
// =====================================================

interface StalledProjectsCardProps {
  projects: StalledProject[];
  onProjectChat: (projectId: string, title: string) => void;
}

function StalledProjectsCard({ projects, onProjectChat }: StalledProjectsCardProps) {
  const severityConfig = {
    mild: { color: BRAND_COLORS.warning, label: 'Mild' },
    moderate: { color: BRAND_COLORS.primary, label: 'Moderate' },
    severe: { color: BRAND_COLORS.error, label: 'Severe' },
  };

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: BRAND_COLORS.bgPrimary, border: `1px solid ${BRAND_COLORS.borderLight}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
          <span className="flex items-center gap-2">
            <TrendingDown size={18} style={{ color: BRAND_COLORS.error }} />
            Stalled Projects
          </span>
        </h3>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: projects.length > 0 ? BRAND_COLORS.bgError : BRAND_COLORS.bgSuccess,
            color: projects.length > 0 ? BRAND_COLORS.error : BRAND_COLORS.success,
          }}
        >
          {projects.length} need attention
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 size={32} className="mx-auto mb-2" style={{ color: BRAND_COLORS.success }} />
          <p className="text-sm font-medium" style={{ color: BRAND_COLORS.success }}>
            All projects are moving!
          </p>
          <p className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
            Great job keeping momentum
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.slice(0, 4).map((project) => {
            const severity = severityConfig[project.severity] || severityConfig.mild;
            return (
              <motion.button
                key={project.id}
                onClick={() => onProjectChat(project.id, project.title)}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
                whileHover={{ backgroundColor: BRAND_COLORS.bgHover }}
              >
                <div
                  className="w-2 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: severity.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate" style={{ color: BRAND_COLORS.textHeading }}>
                    {project.title}
                  </div>
                  <div className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                    {project.days_since_activity} days inactive
                  </div>
                </div>
                <div
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ backgroundColor: `${severity.color}15`, color: severity.color }}
                >
                  {severity.label}
                </div>
                <ChevronRight size={16} style={{ color: BRAND_COLORS.textMuted }} />
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Active Projects Card
// =====================================================

interface ActiveProjectsCardProps {
  projects: ActiveProject[];
  onProjectChat: (projectId: string, title: string) => void;
}

function ActiveProjectsCard({ projects, onProjectChat }: ActiveProjectsCardProps) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: BRAND_COLORS.bgPrimary, border: `1px solid ${BRAND_COLORS.borderLight}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
          Active Projects
        </h3>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{ backgroundColor: BRAND_COLORS.bgSecondary, color: BRAND_COLORS.textMuted }}
        >
          {projects.length} total
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles size={32} className="mx-auto mb-2" style={{ color: BRAND_COLORS.textMuted }} />
          <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
            No active projects yet
          </p>
          <p className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>
            Chat with your coach to start planning
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.slice(0, 6).map((project) => (
            <motion.button
              key={project.id}
              onClick={() => onProjectChat(project.id, project.name || project.title || 'Project')}
              className="flex items-center gap-3 p-4 rounded-lg text-left transition-all"
              style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: BRAND_COLORS.primaryBg }}
              >
                <Target size={18} style={{ color: BRAND_COLORS.primary }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate" style={{ color: BRAND_COLORS.textHeading }}>
                  {project.name || project.title || 'Untitled'}
                </div>
                <div className="text-xs capitalize" style={{ color: BRAND_COLORS.textMuted }}>
                  {project.type || project.status || 'Project'}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Chat View Component
// =====================================================

interface ChatViewProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onClear: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

function ChatView({
  messages,
  isStreaming,
  isLoadingHistory,
  error,
  input,
  setInput,
  onSend,
  onClear,
  messagesEndRef,
}: ChatViewProps) {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col" style={{ backgroundColor: BRAND_COLORS.bgPage }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {isLoadingHistory && (
            <div className="text-center py-4">
              <Loader2 size={24} className="animate-spin mx-auto" style={{ color: BRAND_COLORS.primary }} />
              <p className="text-sm mt-2" style={{ color: BRAND_COLORS.textMuted }}>
                Loading conversation...
              </p>
            </div>
          )}

          {!isLoadingHistory && messages.length === 0 && (
            <div className="text-center py-16">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: BRAND_COLORS.primaryBg }}
              >
                <Zap size={32} style={{ color: BRAND_COLORS.primary }} />
              </div>
              <h3 className="font-semibold text-lg" style={{ color: BRAND_COLORS.textHeading }}>
                Execution Coach
              </h3>
              <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: BRAND_COLORS.textSecondary }}>
                I&apos;m your execution buddy! Ask me about your priorities, stalled projects,
                or anything you need help getting done.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {['What should I focus on this week?', 'Help me with a stalled project', 'Generate my weekly plan'].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="px-4 py-2 rounded-full text-sm transition-colors"
                    style={{
                      backgroundColor: BRAND_COLORS.bgSecondary,
                      color: BRAND_COLORS.textSecondary,
                      border: `1px solid ${BRAND_COLORS.borderLight}`,
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm"
              style={{ color: BRAND_COLORS.textMuted }}
            >
              <Loader2 size={16} className="animate-spin" />
              Coach is thinking...
            </motion.div>
          )}

          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg text-sm"
              style={{ backgroundColor: BRAND_COLORS.bgError, color: BRAND_COLORS.error }}
            >
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div
        className="border-t p-4"
        style={{ backgroundColor: BRAND_COLORS.bgPrimary, borderColor: BRAND_COLORS.borderLight }}
      >
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          {messages.length > 0 && (
            <button
              onClick={onClear}
              className="p-3 rounded-xl text-sm transition-colors"
              style={{
                backgroundColor: BRAND_COLORS.bgSecondary,
                color: BRAND_COLORS.textMuted,
              }}
              title="Clear chat"
            >
              Clear
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder="Ask your execution coach anything..."
            className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
            style={{
              borderColor: BRAND_COLORS.borderDefault,
              backgroundColor: BRAND_COLORS.bgPrimary,
            }}
            disabled={isStreaming}
          />
          <motion.button
            onClick={onSend}
            disabled={isStreaming || !input.trim()}
            className="p-3 rounded-xl text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: BRAND_COLORS.primary }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Chat Bubble Component
// =====================================================

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div
          className="max-w-xl px-4 py-3 rounded-2xl rounded-br-sm text-white"
          style={{ backgroundColor: BRAND_COLORS.primary }}
        >
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: BRAND_COLORS.primaryBg }}
      >
        <Zap size={16} style={{ color: BRAND_COLORS.primary }} />
      </div>
      <div className="max-w-xl">
        <span className="text-xs font-medium" style={{ color: BRAND_COLORS.primary }}>
          Execution Coach
        </span>
        <div
          className="mt-1 px-4 py-3 rounded-2xl rounded-tl-sm"
          style={{
            backgroundColor: BRAND_COLORS.bgPrimary,
            border: `1px solid ${BRAND_COLORS.borderLight}`,
          }}
        >
          {message.content || (
            <span className="flex items-center gap-2" style={{ color: BRAND_COLORS.textMuted }}>
              <Loader2 size={14} className="animate-spin" />
              Typing...
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ExecutionTab;
