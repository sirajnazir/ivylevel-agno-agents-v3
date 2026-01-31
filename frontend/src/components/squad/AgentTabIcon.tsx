'use client';

import { motion } from 'framer-motion';
import { AGENT_PERSONALITIES } from '@/lib/constants/agents';
import type { CrewId } from '@/lib/types/agentState';

interface AgentTabIconProps {
    agentId: CrewId;
    isActive: boolean;
    isHovering?: boolean;  // Triggered when user hovers over related recommendation
    onClick?: () => void;
}

/**
 * AgentTabIcon - Tab bar icon with "nod" animation
 * 
 * Shows agent presence in Frame 5 tabs. When user hovers over a recommendation,
 * the corresponding agent "nods" to show they're the source of that insight.
 */
export function AgentTabIcon({ agentId, isActive, isHovering, onClick }: AgentTabIconProps) {
    const agent = AGENT_PERSONALITIES[agentId];

    if (!agent) {
        console.warn(`[AgentTabIcon] Unknown agentId: ${agentId}`);
        return null;
    }

    return (
        <motion.button
            layoutId={`agent-${agentId}`}  // NEW: Matches AgentSatellite for smooth zoom transition
            onClick={onClick}
            animate={{
                scale: isActive ? 1.15 : 1,
                rotate: isHovering ? [0, -8, 8, -5, 5, 0] : 0,  // "Nod" animation
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{
                rotate: { duration: 0.5, ease: 'easeInOut' },
                scale: { duration: 0.2 },
            }}
            style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: agent.color,
                boxShadow: isActive
                    ? `0 0 20px ${agent.color}, 0 0 30px ${agent.color}`
                    : `0 0 10px ${agent.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
                border: isActive ? `3px solid white` : 'none',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'visible',
            }}
            aria-label={`${agent.name} - ${agent.title}`}
            title={agent.name}
        >
            {/* First letter of agent name */}
            {agent.name[0]}

            {/* Active indicator pulse */}
            {isActive && (
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={{
                        position: 'absolute',
                        inset: -4,
                        borderRadius: '50%',
                        border: `2px solid ${agent.color}`,
                        pointerEvents: 'none',
                    }}
                />
            )}
        </motion.button>
    );
}
