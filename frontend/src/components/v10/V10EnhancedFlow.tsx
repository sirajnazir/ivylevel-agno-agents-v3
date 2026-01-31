/**
 * V10EnhancedFlow Wrapper
 * Orchestrates v10.0 agent calls and data flow through assessment.
 * @version 10.0
 */

'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { getFeatureFlags } from '@/lib/config/featureFlags';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { useCRIAgent, useNarrativeAgent, useAssessmentAgent } from '@/lib/hooks/useAgentAPI';
import { emit } from '@/lib/events/eventBus';

interface V10EnhancedFlowProps {
  children: ReactNode;
  currentFrame: number;
  profile: any;
  onAgentDataReady?: () => void;
}

export function V10EnhancedFlow({
  children,
  currentFrame,
  profile,
  onAgentDataReady,
}: V10EnhancedFlowProps) {
  const flags = getFeatureFlags();
  const {
    setAgentDataCache,
    setAgentDataLoading,
    setAgentDataError,
    agentDataCache,
  } = useSessionStore();
  
  const [hasFetchedData, setHasFetchedData] = useState(false);
  
  const criAgent = useCRIAgent();
  const narrativeAgent = useNarrativeAgent();
  const assessmentAgent = useAssessmentAgent();

  // Fetch agent data after Frame 4 completes
  const fetchAgentData = useCallback(async () => {
    if (!flags.v10Agents || hasFetchedData) return;
    
    setAgentDataLoading(true);
    setAgentDataError(null);
    
    try {
      // Parallel agent calls
      const [criResult, narrativeResult, assessmentResult] = await Promise.all([
        flags.criScoring ? criAgent.invoke({ profile }) : Promise.resolve({ success: false, data: undefined }),
        narrativeAgent.invoke({ profile }),
        assessmentAgent.invoke({ profile }),
      ]);

      const cacheUpdate: Record<string, any> = {};

      if (criResult.success && criResult.data) {
        cacheUpdate.cri = criResult.data.cri;
        cacheUpdate.criBoostPercentage = criResult.data.boost_percentage;
        cacheUpdate.criFactors = criResult.data.boost_factors;
        emit('cri.computed', criResult.data, 'cri');
      }

      if (narrativeResult.success && narrativeResult.data) {
        cacheUpdate.narrativeDna = narrativeResult.data.narrative_dna;
        cacheUpdate.narrativeThemes = narrativeResult.data.themes;
        cacheUpdate.archetype = narrativeResult.data.archetype;
        emit('narrative.computed', narrativeResult.data, 'narrative');
      }

      if (assessmentResult.success && assessmentResult.data) {
        cacheUpdate.assessmentTier = assessmentResult.data.tier;
      }

      setAgentDataCache(cacheUpdate);
      setHasFetchedData(true);
      onAgentDataReady?.();
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch agent data';
      setAgentDataError(message);
      emit('agent.error', { error: message }, 'v10flow');
    } finally {
      setAgentDataLoading(false);
    }
  }, [flags.v10Agents, flags.criScoring, profile, hasFetchedData]);

  // Trigger data fetch when leaving Frame 4
  useEffect(() => {
    if (currentFrame === 4 && !hasFetchedData && flags.v10Agents) {
      // Pre-fetch on Frame 4 for smoother transition
      fetchAgentData();
    }
  }, [currentFrame, hasFetchedData, flags.v10Agents, fetchAgentData]);

  // If agents disabled, just render children
  if (!flags.v10Agents) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check if agent data is ready
 */
export function useAgentDataReady(): boolean {
  const { agentDataCache, agentDataLoading } = useSessionStore();
  const flags = getFeatureFlags();
  
  if (!flags.v10Agents) return true;
  
  // Consider ready if we have CRI or narrative data (or loading finished)
  return !agentDataLoading && (
    agentDataCache.cri !== undefined || 
    agentDataCache.narrativeDna !== undefined
  );
}

/**
 * Extract constraints from profile for SuperpowerReveal
 */
export function extractConstraints(profile: any): string[] {
  const constraints: string[] = [];
  const demo = profile?.demographics;
  
  if (demo?.first_gen) constraints.push('first_gen');
  if (demo?.low_ses) constraints.push('low_ses');
  if (demo?.family_duties) constraints.push('family_duties');
  if (demo?.underrepresented) constraints.push('underrepresented');
  if (demo?.work_hours && demo.work_hours > 10) constraints.push('work_hours');
  if (demo?.rural) constraints.push('rural');
  if (demo?.immigrant) constraints.push('immigrant');
  if (demo?.health_challenges) constraints.push('health_challenges');
  
  return constraints;
}

export default V10EnhancedFlow;
