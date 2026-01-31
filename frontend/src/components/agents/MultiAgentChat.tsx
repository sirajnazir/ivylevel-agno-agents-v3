/**
 * MultiAgentChat Component
 *
 * Premium multi-agent chat experience with:
 * - Agent selector tabs (each agent has personality + color)
 * - Animated message bubbles with agent avatars
 * - Handoff transitions between agents
 * - Thinking state with rotating phrases
 * - Responsive input area
 *
 * This replaces the basic useMultiAgentChat pattern with a full
 * CrewAI-powered experience.
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight } from 'lucide-react';
import { AgentAvatar } from './AgentAvatar';
import { useCrewChat } from '@/hooks/useCrewChat';
import type { CrewChatMessage } from '@/hooks/useCrewChat';
import {
  AGENT_PERSONALITIES,
  AGENT_ORDER,
  getThinkingPhrase,
} from '@/lib/constants/agents';
import type { CrewId } from '@/lib/constants/agents';
import { BRAND_COLORS } from '@/lib/constants/brand';

// =============================================================================
// PROPS
// =============================================================================

interface MultiAgentChatProps {
  profileId: string | null;
  initialAgent?: CrewId;
  height?: string;
  onAgentChange?: (agentId: CrewId) => void;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function AgentTab({
  agentId,
  isActive,
  onClick,
}: {
  agentId: CrewId;
  isActive: boolean;
  onClick: () => void;
}) {
  const agent = AGENT_PERSONALITIES[agentId];

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        border: isActive ? `2px solid ${agent.color}` : '1px solid #E6EAEE',
        backgroundColor: isActive ? agent.colorBg : 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      <AgentAvatar
        agentId={agentId}
        size="sm"
        state={isActive ? 'idle' : 'idle'}
      />
      <span
        style={{
          fontSize: '12px',
          fontWeight: isActive ? 600 : 500,
          color: isActive ? agent.color : BRAND_COLORS.textSecondary,
        }}
      >
        {agent.name}
      </span>
    </button>
  );
}

function HandoffMessage({ message }: { message: CrewChatMessage }) {
  const agentId = message.agentId || 'execution';
  const agent = AGENT_PERSONALITIES[agentId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '8px 16px',
        margin: '12px auto',
        maxWidth: '80%',
        borderRadius: '16px',
        backgroundColor: '#F5F4F3',
        border: '1px solid #E6EAEE',
      }}
    >
      <ArrowRight size={14} color={agent.color} />
      <span
        style={{
          fontSize: '12px',
          color: BRAND_COLORS.textSecondary,
          fontStyle: 'italic',
        }}
      >
        {message.content}
      </span>
    </motion.div>
  );
}

function ChatBubble({ message }: { message: CrewChatMessage }) {
  const agentId = message.agentId || 'execution';
  const agent = AGENT_PERSONALITIES[agentId];
  const isUser = message.role === 'user';

  if (message.isHandoff) {
    return <HandoffMessage message={message} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: '8px',
        marginBottom: '12px',
        paddingLeft: isUser ? '48px' : '0',
        paddingRight: isUser ? '0' : '48px',
      }}
    >
      {/* Agent avatar (only for assistant messages) */}
      {!isUser && (
        <div style={{ flexShrink: 0, marginBottom: '4px' }}>
          <AgentAvatar
            agentId={agentId}
            size="sm"
            state={message.isProcessing ? 'thinking' : 'idle'}
          />
        </div>
      )}

      {/* Message bubble */}
      <div
        style={{
          maxWidth: '85%',
          padding: '10px 14px',
          borderRadius: isUser
            ? '18px 18px 4px 18px'
            : '18px 18px 18px 4px',
          backgroundColor: isUser ? agent.color : agent.colorBg,
          color: isUser ? 'white' : BRAND_COLORS.textPrimary,
          fontSize: '14px',
          lineHeight: '1.5',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          border: isUser ? 'none' : `1px solid ${agent.color}20`,
        }}
      >
        {message.isProcessing ? (
          <ThinkingIndicator agentId={agentId} />
        ) : (
          message.content
        )}
      </div>
    </motion.div>
  );
}

function ThinkingIndicator({ agentId }: { agentId: CrewId }) {
  const [phrase, setPhrase] = useState(() => getThinkingPhrase(agentId));
  const agent = AGENT_PERSONALITIES[agentId];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhrase(getThinkingPhrase(agentId));
    }, 3000);
    return () => clearInterval(interval);
  }, [agentId]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Animated dots */}
      <div style={{ display: 'flex', gap: '3px' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: agent.color,
            }}
          />
        ))}
      </div>
      <motion.span
        key={phrase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        style={{ fontSize: '12px', color: BRAND_COLORS.textMuted, fontStyle: 'italic' }}
      >
        {phrase}
      </motion.span>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MultiAgentChat({
  profileId,
  initialAgent = 'execution',
  height = '600px',
  onAgentChange,
}: MultiAgentChatProps) {
  const {
    messages,
    activeAgent,
    isProcessing,
    error,
    sendMessage,
    switchAgent,
    clearError,
  } = useCrewChat({ profileId, initialAgent });

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentAgent = AGENT_PERSONALITIES[activeAgent];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle agent switch
  const handleAgentSwitch = useCallback(
    (agentId: CrewId) => {
      if (agentId === activeAgent || isProcessing) return;
      switchAgent(agentId);
      onAgentChange?.(agentId);
    },
    [activeAgent, isProcessing, switchAgent, onAgentChange]
  );

  // Handle send
  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isProcessing) return;
    setInputValue('');
    await sendMessage(content);
    inputRef.current?.focus();
  }, [inputValue, isProcessing, sendMessage]);

  // Handle enter key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height,
        backgroundColor: BRAND_COLORS.bgPrimary,
        borderRadius: '16px',
        border: `1px solid ${BRAND_COLORS.borderLight}`,
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}
    >
      {/* ================================================================= */}
      {/* HEADER: Active Agent + Agent Tabs                                  */}
      {/* ================================================================= */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${BRAND_COLORS.borderLight}`,
          backgroundColor: BRAND_COLORS.bgPrimary,
        }}
      >
        {/* Current agent info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
          }}
        >
          <AgentAvatar
            agentId={activeAgent}
            size="md"
            state={isProcessing ? 'thinking' : 'idle'}
            showName
            showThinking={isProcessing}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '11px',
                color: BRAND_COLORS.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {currentAgent.title}
            </div>
          </div>
        </div>

        {/* Agent tabs */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none',
          }}
        >
          {AGENT_ORDER.map((agentId) => (
            <AgentTab
              key={agentId}
              agentId={agentId}
              isActive={agentId === activeAgent}
              onClick={() => handleAgentSwitch(agentId)}
            />
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* MESSAGES AREA                                                      */}
      {/* ================================================================= */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          scrollbarWidth: 'thin',
        }}
      >
        {/* Empty state */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '16px',
              textAlign: 'center',
              padding: '24px',
            }}
          >
            <AgentAvatar agentId={activeAgent} size="lg" state="idle" />
            <div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: currentAgent.color,
                  marginBottom: '4px',
                }}
              >
                {currentAgent.name}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: BRAND_COLORS.textSecondary,
                  maxWidth: '300px',
                }}
              >
                {currentAgent.description}
              </div>
            </div>
            <div
              style={{
                fontSize: '14px',
                color: BRAND_COLORS.textPrimary,
                fontStyle: 'italic',
                padding: '12px 20px',
                backgroundColor: currentAgent.colorBg,
                borderRadius: '12px',
                border: `1px solid ${currentAgent.color}20`,
                maxWidth: '360px',
              }}
            >
              &ldquo;{currentAgent.greeting}&rdquo;
            </div>

            {/* Suggested prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {getSuggestedPrompts(activeAgent).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputValue(prompt);
                    inputRef.current?.focus();
                  }}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                    backgroundColor: 'white',
                    color: BRAND_COLORS.textSecondary,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = currentAgent.color;
                    e.currentTarget.style.color = currentAgent.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = BRAND_COLORS.borderLight;
                    e.currentTarget.style.color = BRAND_COLORS.textSecondary;
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ================================================================= */}
      {/* ERROR BANNER                                                       */}
      {/* ================================================================= */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              padding: '8px 16px',
              backgroundColor: BRAND_COLORS.bgError,
              borderTop: `1px solid ${BRAND_COLORS.error}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '12px', color: BRAND_COLORS.error }}>
              {error}
            </span>
            <button
              onClick={clearError}
              style={{
                fontSize: '11px',
                color: BRAND_COLORS.error,
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* INPUT AREA                                                         */}
      {/* ================================================================= */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${BRAND_COLORS.borderLight}`,
          backgroundColor: BRAND_COLORS.bgPrimary,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: BRAND_COLORS.bgPill,
            borderRadius: '24px',
            padding: '4px 4px 4px 16px',
            border: `1px solid ${BRAND_COLORS.borderLight}`,
            transition: 'border-color 0.2s',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${currentAgent.name}...`}
            disabled={isProcessing || !profileId}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '14px',
              color: BRAND_COLORS.textPrimary,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isProcessing || !profileId}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor:
                inputValue.trim() && !isProcessing
                  ? currentAgent.color
                  : BRAND_COLORS.bgSecondary,
              color: inputValue.trim() && !isProcessing ? 'white' : BRAND_COLORS.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputValue.trim() && !isProcessing ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SUGGESTED PROMPTS PER AGENT
// =============================================================================

function getSuggestedPrompts(agentId: CrewId): string[] {
  const prompts: Record<CrewId, string[]> = {
    execution: [
      "What should I focus on this week?",
      "I'm falling behind on my plan",
      "Help me prioritize my tasks",
    ],
    academic: [
      "Review my course trajectory",
      "What AP classes should I take next year?",
      "Help me plan for the SAT",
    ],
    ec: [
      "Evaluate my extracurriculars",
      "Which activities should I drop?",
      "How do I show leadership?",
    ],
    awards: [
      "What awards should I target?",
      "Find competitions in my spike area",
      "Am I competitive for this award?",
    ],
    programs: [
      "Find summer programs for me",
      "What research programs fit my profile?",
      "Which programs are worth the money?",
    ],
    assessment: [
      "Assess my four pillars",
      "What's my archetype?",
      "Where are my biggest gaps?",
    ],
    gameplan: [
      "Create my 6-month plan",
      "Am I on track?",
      "What should next semester look like?",
    ],
  };
  return prompts[agentId] || [];
}

export default MultiAgentChat;
