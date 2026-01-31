'use client';

import { motion } from 'framer-motion';
import { AGENT_PERSONALITIES } from '@/lib/constants/agents';
import type { CrewId } from '@/lib/types/agentState';

interface AgentBadgeProps {
    agentId: CrewId;
    variant?: 'full' | 'compact';
    className?: string;
}

/**
 * AgentBadge - Shows "Analyzed by [Agent Name]" attribution
 * 
 * Builds trust by showing which expert agent generated the recommendation.
 * Uses agent personality colors and 2D CSS bot icon.
 */
export function AgentBadge({ agentId, variant = 'full', className }: AgentBadgeProps) {
    const agent = AGENT_PERSONALITIES[agentId];

    if (!agent) {
        console.warn(`[AgentBadge] Unknown agentId: ${agentId}`);
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: variant === 'full' ? 8 : 4,
                padding: variant === 'full' ? '6px 12px' : '3px 8px',
                backgroundColor: agent.colorBg,
                border: `1.5px solid ${agent.color}`,
                borderRadius: 16,
                fontSize: variant === 'full' ? 12 : 10,
                fontWeight: 600,
                color: agent.color,
                whiteSpace: 'nowrap',
            }}
        >
            {/* 2D CSS Bot Icon */}
            <motion.div
                animate={{
                    boxShadow: [
                        `0 0 6px ${agent.color}`,
                        `0 0 10px ${agent.color}`,
                        `0 0 6px ${agent.color}`,
                    ],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    width: variant === 'full' ? 18 : 14,
                    height: variant === 'full' ? 18 : 14,
                    borderRadius: '50%',
                    backgroundColor: agent.color,
                    flexShrink: 0,
                }}
            />

            {variant === 'full' && (
                <span>Analyzed by {agent.name}</span>
            )}

            {variant === 'compact' && (
                <span>{agent.name}</span>
            )}
        </motion.div>
    );
}
