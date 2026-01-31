/**
 * AgentAvatar Component
 *
 * Animated agent avatar with multiple states:
 * - idle: gentle breathing pulse
 * - thinking: rotating glow with thinking phrase
 * - speaking: active pulse animation
 * - celebrating: bounce + sparkle effect
 * - handoff: fade out transition
 *
 * Uses the agent's brand color for all visual effects.
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  GraduationCap,
  Activity,
  Award,
  Compass,
  Scan,
  Map,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CrewId, AgentState } from '@/lib/constants/agents';
import { AGENT_PERSONALITIES, getThinkingPhrase } from '@/lib/constants/agents';

// =============================================================================
// ICON MAP
// =============================================================================

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  GraduationCap,
  Activity,
  Award,
  Compass,
  Scan,
  Map,
};

// =============================================================================
// PROPS
// =============================================================================

interface AgentAvatarProps {
  agentId: CrewId;
  state?: AgentState;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showThinking?: boolean;
  className?: string;
}

// =============================================================================
// SIZE CONFIG
// =============================================================================

const SIZE_CONFIG = {
  sm: { container: 32, icon: 16, ring: 36 },
  md: { container: 44, icon: 22, ring: 50 },
  lg: { container: 60, icon: 30, ring: 68 },
} as const;

// =============================================================================
// COMPONENT
// =============================================================================

export function AgentAvatar({
  agentId,
  state = 'idle',
  size = 'md',
  showName = false,
  showThinking = false,
}: AgentAvatarProps) {
  const agent = AGENT_PERSONALITIES[agentId];
  const sizeConfig = SIZE_CONFIG[size];
  const IconComponent = ICON_MAP[agent.icon] || Zap;

  const thinkingPhrase = React.useMemo(() => {
    if (state === 'thinking') return getThinkingPhrase(agentId);
    return '';
  }, [state, agentId]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ position: 'relative' }}>
        {/* Outer ring animation */}
        <AnimatePresence>
          {state === 'thinking' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.15, 1],
                rotate: [0, 360],
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                opacity: { duration: 2, repeat: Infinity },
                scale: { duration: 2, repeat: Infinity },
                rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: sizeConfig.ring,
                height: sizeConfig.ring,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                border: `2px solid ${agent.color}`,
                borderTopColor: 'transparent',
              }}
            />
          )}

          {state === 'speaking' && (
            <motion.div
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: sizeConfig.ring,
                height: sizeConfig.ring,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                backgroundColor: agent.colorBg,
              }}
            />
          )}

          {state === 'celebrating' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.8, 1.4, 0.8],
              }}
              transition={{ duration: 1, repeat: 2 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: sizeConfig.ring,
                height: sizeConfig.ring,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                backgroundColor: agent.colorBg,
                boxShadow: `0 0 20px ${agent.color}40`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Main avatar circle */}
        <motion.div
          animate={
            state === 'idle'
              ? { scale: [1, 1.03, 1] }
              : state === 'celebrating'
                ? { scale: [1, 1.1, 0.95, 1.05, 1], y: [0, -4, 0, -2, 0] }
                : state === 'handoff'
                  ? { opacity: [1, 0.3], scale: [1, 0.9] }
                  : {}
          }
          transition={
            state === 'idle'
              ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
              : state === 'celebrating'
                ? { duration: 0.8 }
                : state === 'handoff'
                  ? { duration: 0.4 }
                  : {}
          }
          style={{
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderRadius: '50%',
            backgroundColor: agent.colorBg,
            border: `2px solid ${agent.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <IconComponent size={sizeConfig.icon} color={agent.color} />
        </motion.div>

        {/* Active indicator dot */}
        {(state === 'speaking' || state === 'thinking') && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              bottom: size === 'sm' ? -1 : 0,
              right: size === 'sm' ? -1 : 0,
              width: size === 'sm' ? 8 : 10,
              height: size === 'sm' ? 8 : 10,
              borderRadius: '50%',
              backgroundColor: state === 'thinking' ? agent.color : '#1DBF73',
              border: '2px solid white',
              zIndex: 2,
            }}
          />
        )}
      </div>

      {/* Name + thinking phrase */}
      {(showName || (showThinking && state === 'thinking')) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {showName && (
            <span
              style={{
                fontSize: size === 'sm' ? '12px' : '13px',
                fontWeight: 600,
                color: agent.color,
                lineHeight: 1.2,
              }}
            >
              {agent.name}
            </span>
          )}
          <AnimatePresence mode="wait">
            {showThinking && state === 'thinking' && (
              <motion.span
                key={thinkingPhrase}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontSize: '11px',
                  color: '#9698A6',
                  fontStyle: 'italic',
                  lineHeight: 1.2,
                }}
              >
                {thinkingPhrase}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default AgentAvatar;
