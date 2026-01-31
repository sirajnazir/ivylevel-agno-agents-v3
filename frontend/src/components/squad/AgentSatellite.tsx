'use client';

import { motion } from 'framer-motion';
import { AgentSatelliteProps } from './types';
import { AGENT_PERSONALITIES } from '@/lib/constants/agents';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

const POSITION_STYLES = {
    'top-left': 'absolute top-20 left-20',
    'top-right': 'absolute top-20 right-20',
    'bottom-left': 'absolute bottom-20 left-20',
    'bottom-right': 'absolute bottom-20 right-20',
} as const;

export function AgentSatellite({
    agentId,
    status,
    position,
    currentStep,
}: AgentSatelliteProps) {
    const agent = AGENT_PERSONALITIES[agentId];

    const isActive = status === 'active';
    const isLoading = status === 'loading' || status === 'retrying';
    const isError = status === 'error';

    return (
        <motion.div
            layoutId={`agent-${agentId}`}  // NEW: Shared layout ID for smooth transition to tab
            className={POSITION_STYLES[position]}
            initial={{ scale: 0, opacity: 0, y: -100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
            }}
        >
            <div className="relative flex flex-col items-center">
                {/* Agent Icon Container */}
                <motion.div
                    className="w-24 h-24 rounded-full flex items-center justify-center relative overflow-hidden"
                    style={{
                        backgroundColor: isActive ? agent.colorBg : 'rgba(156, 163, 175, 0.1)',
                        border: `3px solid ${isActive ? agent.color : '#9ca3af'}`,
                    }}
                    animate={
                        isActive
                            ? {
                                boxShadow: [
                                    `0 0 20px ${agent.color}`,
                                    `0 0 40px ${agent.color}, 0 0 60px ${agent.color}`,
                                    `0 0 20px ${agent.color}`,
                                ],
                            }
                            : isLoading
                                ? {
                                    boxShadow: [
                                        '0 0 10px rgba(156, 163, 175, 0.3)',
                                        '0 0 20px rgba(156, 163, 175, 0.5)',
                                        '0 0 10px rgba(156, 163, 175, 0.3)',
                                    ],
                                }
                                : {}
                    }
                    transition={
                        isActive || isLoading
                            ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                            : {}
                    }
                >
                    {/* Background glow effect for active state */}
                    {isActive && (
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: `radial-gradient(circle, ${agent.colorLight} 0%, transparent 70%)`,
                            }}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    )}

                    {/* Icon or Status Indicator */}
                    <div className="relative z-10">
                        {isLoading && (
                            <Loader2
                                className="w-8 h-8 text-gray-400 animate-spin"
                            />
                        )}
                        {isActive && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            >
                                <Check
                                    className="w-8 h-8"
                                    style={{ color: agent.color }}
                                />
                            </motion.div>
                        )}
                        {isError && (
                            <AlertCircle className="w-8 h-8 text-yellow-500" />
                        )}
                        {status === 'idle' && (
                            <div className="w-8 h-8 rounded-full bg-gray-300" />
                        )}
                    </div>
                </motion.div>

                {/* Agent Name */}
                <motion.p
                    className="mt-2 text-sm font-semibold"
                    style={{ color: isActive ? agent.color : '#6b7280' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {agent.name}
                </motion.p>

                {/* Status Text */}
                {(isActive || isLoading || isError) && (
                    <motion.p
                        className="mt-1 text-xs font-medium text-center max-w-[120px]"
                        style={{ color: isActive ? agent.color : '#6b7280' }}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        {isActive && `${agent.title} ready`}
                        {isLoading && (currentStep || 'Analyzing...')}
                        {isError && 'Retrying...'}
                    </motion.p>
                )}
            </div>
        </motion.div>
    );
}
