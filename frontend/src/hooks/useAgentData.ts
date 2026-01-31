/**
 * IvyLevel Agent Data Hooks - ANTIGRAVITY PROPULSION PHASE
 * 
 * This file contains React Query hooks that bridge the UI to the Agno backend.
 * Each hook attempts to call the real Agno API, but gracefully falls back to
 * placeholder data if the backend is unavailable (Antigravity pattern).
 * 
 * Architecture:
 * UI Components → React Query Hooks (this file) → agnoClient → Agno Backend
 */

'use client';

import { useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { agnoApi } from '@/lib/api/agnoClient';
import { agentV13Api } from '@/lib/api/agentV13Client';

// ============================================================================
// TYPES
// ============================================================================

export interface AgentHealthData {
  status: string;
  version?: string;
  react_enabled?: boolean;
  memory_enabled?: boolean;
  hitl_enabled?: boolean;
  latency?: number;
  thresholds?: {
    min_quality: number;
    min_voice: number;
    min_golden: number;
    max_cycles: number;
  };
}

// Flexible types to match component expectations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FlexibleData = Record<string, any> | null;

// ============================================================================
// v13.3 HEALTH HOOK
// ============================================================================

/**
 * Hook for checking agent v13 health status.
 * Uses React Query with auto-refresh every 60 seconds.
 */
export function useAgentV13Health() {
  return useQuery<AgentHealthData>({
    queryKey: ['agent-v13-health'],
    queryFn: async () => {
      try {
        return await agentV13Api.checkHealth();
      } catch (error) {
        console.warn('[useAgentV13Health] Backend unavailable:', error);
        return {
          status: 'unavailable',
          version: '13.0',
          react_enabled: false,
          memory_enabled: false,
          hitl_enabled: false,
          latency: 0,
        };
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: 3,
  });
}

// ============================================================================
// 1. ASSESSMENT AGENT HOOKS
// ============================================================================

/**
 * Synthesize narrative DNA for a student profile
 * 🚀 PROPULSION: Calls real Agno backend
 * 🛬 LANDING: Graceful fallback if unavailable
 */
export function useNarrativeDNA(profileId: string | null) {
  return useQuery({
    queryKey: ['assessment', 'narrative', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      try {
        // 🚀 PROPULSION: Real lift-off
        const res = await agnoApi.synthesizeNarrative(profileId);

        // Map Agno response to UI interface
        return {
          dna: (res as any).data?.narrative_dna || '',
          themes: (res as any).data?.themes || [],
          confidence: (res as any).data?.confidence_score || 0,
          rationale: (res as any).data?.reasoning || '',
          identity_markers: (res as any).data?.markers || []
        };
      } catch (error) {
        console.warn('[useNarrativeDNA] Backend unavailable, engaging fallback:', error);

        // 🛬 LANDING: Graceful fallback (Antigravity)
        return {
          dna: 'Assessment Pending...',
          themes: [],
          confidence: 0,
          rationale: 'Connecting to Agno Intelligence...',
          identity_markers: []
        };
      }
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
    retry: 1, // Don't hammer the backend if it's down
  });
}

/**
 * Get identity seeds for narrative development
 */
export function useIdentitySeeds(profileId: string | null) {
  return useQuery({
    queryKey: ['assessment', 'seeds', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      try {
        const res = await agnoApi.getIdentitySeeds(profileId);
        return (res as any).data?.seeds || [];
      } catch (e) {
        console.warn('[useIdentitySeeds] Fallback:', e);
        return [];
      }
    },
    enabled: !!profileId,
  });
}

/**
 * Enhanced assessment with AI insights
 * Legacy hook - maps to synthesizeNarrative
 * 🆕 V2: Now includes multi-dimensional archetype data
 */
export function useAssessmentEnhancement(profileId: string | null) {
  return useQuery({
    queryKey: ['assessment', 'enhancement', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      try {
        const res = await agnoApi.synthesizeNarrative(profileId);
        const data = (res as any).data;

        // Extract V2 archetype if present
        const archetypeV2 = data?.archetype_v2 || null;

        return {
          narrative_dna: data?.narrative_dna || '',
          brand_statement: data?.brand_statement || '',
          themes: data?.themes || [],
          confidence_score: data?.confidence_score || 0,
          // Legacy archetype (backward compatible)
          archetype: data?.archetype ? {
            id: data.archetype_id || 'EXPLORER',
            label: typeof data.archetype === 'object'
              ? (data.archetype.name || data.archetype.label || data.archetype.id || 'Scholar')
              : data.archetype,
            confidence: data.archetype_confidence || data.archetype?.confidence || 0
          } : null,
          // 🆕 V2 Multi-Dimensional Archetype
          archetype_v2: archetypeV2 ? {
            composite_code: archetypeV2.composite_code || '',
            domain: archetypeV2.domain || {},
            context: archetypeV2.context || {},
            execution: archetypeV2.execution || {},
            timeline: archetypeV2.timeline || {},
            strategy_family: archetypeV2.strategy_family || '',
            // Convenience accessors
            is_urm: archetypeV2.context?.is_urm || false,
            is_first_gen: archetypeV2.context?.is_first_gen || false,
            diversity_angles: archetypeV2.context?.diversity_angles || [],
            gender: archetypeV2.context?.gender || 'prefer_not_to_say',
            ethnicity: archetypeV2.context?.ethnicity || 'prefer_not_to_say',
            execution_style: archetypeV2.execution?.primary_style || 'balanced_executor',
          } : null,
          cri: data?.cri || 0,
        };
      } catch (e) {
        return null;
      }
    },
    enabled: !!profileId,
  });
}

// ============================================================================
// 2. GAME PLAN AGENT HOOKS
// ============================================================================

/**
 * Generate comprehensive strategic game plan
 * 🚀 PROPULSION: Calls real Agno backend
 */
export function useGamePlan(profileId: string | null) {
  return useQuery({
    queryKey: ['gameplan', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      try {
        const res = await agnoApi.generateGamePlan(profileId);
        return {
          game_plan: (res as any).data?.game_plan || (res as any).data || {},
        };
      } catch (e) {
        console.warn('[useGamePlan] Fallback:', e);
        // Fallback: Empty plan (UI handles empty state)
        return {
          game_plan: {
            activities: [],
            identity_seeds: [],
            phases: [],
            strategic_insights: [],
          }
        };
      }
    },
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get filtered activities based on profile
 */
export function useFilteredActivities(profileId: string | null) {
  return useQuery({
    queryKey: ['gameplan', 'activities', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      try {
        const res = await agnoApi.getFilteredActivities(profileId);
        return (res as any).data?.activities || [];
      } catch (e) {
        return [];
      }
    },
    enabled: !!profileId,
  });
}

// ============================================================================
// 3. EXECUTION AGENT HOOKS
// ============================================================================

/**
 * Calculate execution debt score
 * 🚀 PROPULSION: Calls real Agno backend
 */
export function useExecutionDebtScore(profileId: string | null) {
  return useQuery({
    queryKey: ['execution', 'debt', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      try {
        const res = await agnoApi.calculateDebtScore(profileId);
        return {
          execution_debt_score: (res as any).data?.score || 0,
          status: (res as any).data?.status || 'healthy',
          factors: (res as any).data?.factors || [],
          trend: (res as any).data?.trend || 'stable'
        };
      } catch (e) {
        console.warn('[useExecutionDebtScore] Fallback:', e);
        return {
          execution_debt_score: 0,
          status: 'healthy',
          factors: [],
          trend: 'stable'
        };
      }
    },
    enabled: !!profileId,
  });
}

/**
 * Get current blockers and obstacles
 */
export function useBlockers(profileId: string | null) {
  return useQuery({
    queryKey: ['execution', 'blockers', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      try {
        const res = await agnoApi.getBlockers(profileId);
        return (res as any).data?.blockers || [];
      } catch (e) {
        return [];
      }
    },
    enabled: !!profileId,
  });
}

// ============================================================================
// 4. AWARDS AGENT HOOKS
// ============================================================================

/**
 * Match student to awards and competitions
 * 🚀 PROPULSION: Calls real Agno backend
 */
export function useAwardMatches(profileId: string | null) {
  return useQuery({
    queryKey: ['awards', 'matches', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      try {
        const res = await agnoApi.matchAwards(profileId);
        return {
          portfolio: (res as any).data?.portfolio || {
            reach: [],
            target: [],
            safety: [],
            expected_wins: 0
          },
          matches: (res as any).data?.matches || []
        };
      } catch (e) {
        console.warn('[useAwardMatches] Fallback:', e);
        return {
          portfolio: {
            reach: [],
            target: [],
            safety: [],
            expected_wins: 0
          },
          matches: []
        };
      }
    },
    enabled: !!profileId,
  });
}

/**
 * Get award portfolio analysis
 */
export function useAwardPortfolio(profileId: string | null) {
  return useQuery({
    queryKey: ['awards', 'portfolio', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      try {
        const res = await agnoApi.getAwardPortfolio(profileId);
        return (res as any).data?.portfolio || null;
      } catch (e) {
        return null;
      }
    },
    enabled: !!profileId,
  });
}

// ============================================================================
// 5. OPPORTUNITY AGENT HOOKS
// ============================================================================

/**
 * Find matching opportunities (programs, internships, etc.)
 */
export function useOpportunityMatches(profileId: string | null) {
  return useQuery({
    queryKey: ['opportunities', 'matches', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      try {
        const res = await agnoApi.findOpportunities(profileId);
        return {
          matches: (res as any).data?.matches || []
        };
      } catch (e) {
        return null;
      }
    },
    enabled: !!profileId,
  });
}

/**
 * Get opportunity alerts (deadlines, urgent items)
 * 🚀 PROPULSION: Calls real Agno backend
 */
export function useOpportunityAlerts(profileId: string | null) {
  return useQuery({
    queryKey: ['opportunities', 'alerts', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      try {
        const res = await agnoApi.getOpportunityAlerts(profileId);
        return {
          alerts: (res as any).data?.alerts || [],
          urgent_count: (res as any).data?.urgent_count || 0
        };
      } catch (e) {
        console.warn('[useOpportunityAlerts] Fallback:', e);
        return {
          alerts: [],
          urgent_count: 0
        };
      }
    },
    enabled: !!profileId,
  });
}

// ============================================================================
// 6. DASHBOARD COORDINATOR
// ============================================================================

/**
 * Dashboard coordinator hook
 * Manages cache invalidation for all agent queries
 */
export function useDashboardV13Data(profileId: string | null) {
  const queryClient = useQueryClient();

  const refetchAll = useCallback(() => {
    if (!profileId) return;

    // Invalidate all major agent keys to force a re-fetch from the backend
    const keys = [
      ['agent-v13-health'],
      ['assessment'],
      ['gameplan'],
      ['execution'],
      ['awards'],
      ['opportunities']
    ];

    keys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));

    console.log('[useDashboardV13Data] Refetched all agent data');
  }, [profileId, queryClient]);

  return {
    // Individual hooks manage their own loading state
    isLoading: false,
    refetchAll,
  };
}

/**
 * Legacy hook for compatibility
 */
export function useDashboardData(profileId: string | null) {
  return useDashboardV13Data(profileId);
}

/**
 * Agent health hook (legacy compatibility)
 */
export function useAgentHealth() {
  return useAgentV13Health();
}

// ============================================================================
// 7. NOTIFICATION HOOKS
// ============================================================================

export function useNotifications(profileId: string | null) {
  return useQuery({
    queryKey: ['notifications', profileId],
    queryFn: async () => {
      // Placeholder until real notification endpoint exists
      return { notifications: [] };
    },
    enabled: !!profileId,
    initialData: { notifications: [] }
  });
}

export function useNotificationCount(profileId: string | null) {
  const { data } = useNotifications(profileId);
  // Also check alerts
  const alerts = useOpportunityAlerts(profileId);
  return (data?.notifications?.length || 0) + (alerts.data?.urgent_count || 0);
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ profileId, notificationId }: { profileId: string; notificationId: string }) => {
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileId: string) => {
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

// ============================================================================
// EXPORT ALL HOOKS
// ============================================================================

export default {
  useAgentV13Health,
  useNarrativeDNA,
  useIdentitySeeds,
  useAssessmentEnhancement,
  useGamePlan,
  useFilteredActivities,
  useExecutionDebtScore,
  useBlockers,
  useAwardMatches,
  useAwardPortfolio,
  useOpportunityMatches,
  useOpportunityAlerts,
  useDashboardV13Data,
  useDashboardData,

  useAgentHealth,
  useNotifications,
  useNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
};
