'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SquadAssemblyAnimationProps } from './types';
import { AgentSatellite } from './AgentSatellite';
import { IvyCoachAvatar } from './IvyCoachAvatar';
import { useCurrentStep, useCurrentAgent } from '@/lib/store/useSquadStore';
import { getKaiNarration } from '@/lib/api/agentAPI';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // 0.2s delay between each agent
            delayChildren: 0.3,   // Wait 0.3s before starting
        },
    },
};

export function SquadAssemblyAnimation({
    agentStates,
    onComplete,
    onSkip,
    showSkipButton = true,
}: SquadAssemblyAnimationProps) {
    const currentStep = useCurrentStep();
    const currentAgent = useCurrentAgent();
    const [kaiState, setKaiState] = useState<'thinking' | 'celebrating'>('thinking');

    // Check if all agents are active
    const allActive = Object.values(agentStates).every((status) => status === 'active');

    // Get Kai's narration message
    const kaiMessage = getKaiNarration(currentAgent, currentStep);

    useEffect(() => {
        if (allActive) {
            setKaiState('celebrating');

            // Auto-transition after 1 second
            const timer = setTimeout(() => {
                onComplete?.();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [allActive, onComplete]);

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
            {/* Skip Button */}
            {showSkipButton && !allActive && (
                <motion.button
                    onClick={onSkip}
                    className="absolute top-4 right-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-white/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                >
                    Skip →
                </motion.button>
            )}

            {/* Center: Kai */}
            <div className="relative z-10">
                <IvyCoachAvatar
                    state={kaiState}
                    message={kaiMessage}
                    context="center-stage"
                    position="center"
                />

                {/* Current Step Indicator */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        className="absolute -bottom-32 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            {currentStep}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Ring Animation (appears when all active) */}
            <AnimatePresence>
                {allActive && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <motion.div
                            className="w-96 h-96 rounded-full border-4 border-orange-500"
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 4 Agent Satellites (staggered entry) */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="absolute inset-0"
            >
                <AgentSatellite
                    agentId="academic"
                    status={agentStates.academic}
                    position="top-left"
                    currentStep={currentAgent === 'academic' ? currentStep : undefined}
                />

                <AgentSatellite
                    agentId="ec"
                    status={agentStates.ec}
                    position="top-right"
                    currentStep={currentAgent === 'ec' ? currentStep : undefined}
                />

                <AgentSatellite
                    agentId="awards"
                    status={agentStates.awards}
                    position="bottom-left"
                    currentStep={currentAgent === 'awards' ? currentStep : undefined}
                />

                <AgentSatellite
                    agentId="programs"
                    status={agentStates.programs}
                    position="bottom-right"
                    currentStep={currentAgent === 'programs' ? currentStep : undefined}
                />
            </motion.div>
        </div>
    );
}
