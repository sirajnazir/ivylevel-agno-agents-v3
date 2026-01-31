/**
 * Crew Chat Hook - ANTIGRAVITY PROPULSION PHASE
 * Provides multi-agent chat interface with real Agno backend integration
 * 
 * 🚀 PROPULSION: Calls real agnoApi.sendChatMessage
 * 🛬 LANDING: Graceful error handling with fallback messages
 */

'use client';

import { useState, useCallback } from 'react';
import { agnoApi } from '@/lib/api/agnoClient';
import { CrewId } from '@/lib/constants/agents';

// Re-export CrewId for convenience
export type { CrewId } from '@/lib/constants/agents';

// ============================================================
// TYPES
// ============================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  crewId?: CrewId;
  agentId?: CrewId;  // Alias for crewId (some components use this)
  agentName?: string;
  isHandoff?: boolean;
  isProcessing?: boolean;
  isError?: boolean;
}

// Alias for backwards compatibility
export type CrewChatMessage = ChatMessage;

export interface UseCrewChatOptions {
  profileId: string | null;
  crewId?: CrewId;
  initialAgent?: CrewId;
}

export interface UseCrewChatReturn {
  messages: ChatMessage[];
  sendMessage: (content: string, targetAgent?: CrewId) => Promise<void>;
  isLoading: boolean;
  isTyping: boolean;
  isProcessing: boolean;
  error: string | null;
  clearMessages: () => void;
  clearError: () => void;
  activeAgent: CrewId;
  switchAgent: (agentId: CrewId) => void;
}

// ============================================================
// HOOK
// ============================================================

export function useCrewChat({ profileId, crewId, initialAgent }: UseCrewChatOptions): UseCrewChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<CrewId>(crewId || initialAgent || 'assessment');

  const sendMessage = useCallback(async (content: string, targetAgent?: CrewId) => {
    if (!profileId) {
      setError('No profile ID provided');
      return;
    }

    const agent = targetAgent || activeAgent;

    // 1. Optimistic UI: Show user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      crewId: agent,
      agentId: agent,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      // 2. 🚀 PROPULSION: Send to Agno Backend
      const result = await agnoApi.sendChatMessage(profileId, agent, content);

      // 3. Handle Response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: (result as any).data?.response || (result as any).data?.message || (result as any).response || (result as any).message || "I'm processing that information.",
        timestamp: new Date().toISOString(),
        crewId: agent,
        agentId: agent,
        agentName: (result as any).data?.agent_name || (result as any).agent_name || `${agent} Agent`,
        isHandoff: (result as any).data?.is_handoff || (result as any).is_handoff || false,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('[useCrewChat] Error:', err);

      // 4. 🛬 LANDING: Error Fallback
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'Unable to reach agent. The Agno backend may be offline. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [profileId, activeAgent]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const switchAgent = useCallback((agentId: CrewId) => {
    setActiveAgent(agentId);
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    isTyping,
    isProcessing: isLoading,
    error,
    clearMessages,
    clearError,
    activeAgent,
    switchAgent,
  };
}

export default useCrewChat;
