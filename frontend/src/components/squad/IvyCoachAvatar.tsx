'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IvyCoachAvatarProps } from './types';
import { cn } from '@/lib/utils/cn';

const VIDEO_ASSETS = {
    idle: '/assets/avatars/kai_idle.webm',
    speaking: '/assets/avatars/kai_speaking.webm',
    listening: '/assets/avatars/kai_listening.webm',
    thinking: '/assets/avatars/kai_thinking.webm',
    approving: '/assets/avatars/kai_approving.webm',
    concerned: '/assets/avatars/kai_concerned.webm',
    impressed: '/assets/avatars/kai_impressed.webm',
    celebrating: '/assets/avatars/kai_celebrating.webm',
} as const;

const SIZE_CONFIG = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
} as const;

const CONTEXT_STYLES = {
    'center-stage': {
        size: 'w-64 h-64 md:w-80 md:h-80',
        position: 'relative',
        zIndex: 'z-50',
    },
    'coach-corner': {
        size: 'w-32 h-32 md:w-40 md:h-40',
        position: 'fixed',
        zIndex: 'z-40',
    },
    'sidebar': {
        size: 'w-24 h-24 md:w-32 md:h-32',
        position: 'sticky top-4',
        zIndex: 'z-30',
    },
} as const;

const POSITION_STYLES = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
} as const;

export function IvyCoachAvatar({
    state = 'idle',
    message,
    size = 'md',
    context = 'coach-corner',
    position = 'bottom-right',
    className,
    onStateChange,
}: IvyCoachAvatarProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const contextStyle = CONTEXT_STYLES[context];
    const positionStyle = position ? POSITION_STYLES[position] : '';

    // Preload next likely state
    useEffect(() => {
        const nextStates = {
            idle: 'speaking',
            speaking: 'listening',
            listening: 'thinking',
            thinking: 'approving',
        } as const;

        const nextState = nextStates[state as keyof typeof nextStates];
        if (nextState && VIDEO_ASSETS[nextState]) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = VIDEO_ASSETS[nextState];
            document.head.appendChild(link);
        }
    }, [state]);

    // Handle video load with 500ms timeout
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoad = () => setIsVideoLoaded(true);
        const handleError = () => setHasError(true);

        video.addEventListener('loadeddata', handleLoad);
        video.addEventListener('error', handleError);

        // 500ms fallback timeout
        const timeout = setTimeout(() => {
            if (!isVideoLoaded) {
                setHasError(true);
            }
        }, 500);

        return () => {
            video.removeEventListener('loadeddata', handleLoad);
            video.removeEventListener('error', handleError);
            clearTimeout(timeout);
        };
    }, [state, isVideoLoaded]);

    // Fallback to CSS animation if video fails
    if (hasError) {
        return (
            <motion.div
                className={cn(
                    contextStyle.size,
                    contextStyle.position,
                    positionStyle,
                    contextStyle.zIndex,
                    className
                )}
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <CSSFallbackAvatar state={state} message={message} context={context} />
            </motion.div>
        );
    }

    return (
        <motion.div
            className={cn(
                contextStyle.size,
                contextStyle.position,
                positionStyle,
                contextStyle.zIndex,
                className
            )}
            layoutId="kai-avatar" layout // Framer Motion will animate size/position changes
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <AnimatePresence mode="wait">
                <motion.video
                    key={state}
                    ref={videoRef}
                    src={VIDEO_ASSETS[state]}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                />
            </AnimatePresence>

            {/* Speech Bubble */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={cn(
                        'absolute p-4 rounded-xl bg-white shadow-lg border border-gray-200',
                        context === 'center-stage'
                            ? '-bottom-24 left-1/2 -translate-x-1/2 w-80'
                            : 'bottom-full mb-2 left-0 w-64'
                    )}
                >
                    <p className="text-sm text-gray-800">{message}</p>
                    {/* Speech bubble arrow */}
                    <div className={cn(
                        'absolute w-4 h-4 bg-white border rotate-45',
                        context === 'center-stage'
                            ? '-bottom-2 left-1/2 -translate-x-1/2 border-l border-t border-gray-200'
                            : 'top-full -mt-2 left-4 border-b border-r border-gray-200'
                    )} />
                </motion.div>
            )}
        </motion.div>
    );
}

// CSS Fallback (2D animated avatar)
function CSSFallbackAvatar({
    state,
    message,
    context
}: {
    state: string;
    message?: string;
    context: string;
}) {
    return (
        <div className="relative w-full h-full">
            <motion.div
                className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg"
                animate={
                    state === 'thinking' || state === 'celebrating'
                        ? { scale: [1, 1.05, 1] }
                        : {}
                }
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="text-white text-4xl font-bold font-display">K</div>
            </motion.div>

            {/* Speech Bubble for CSS Fallback */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        'absolute p-4 rounded-xl bg-white shadow-lg border border-gray-200',
                        context === 'center-stage'
                            ? '-bottom-24 left-1/2 -translate-x-1/2 w-80'
                            : 'bottom-full mb-2 left-0 w-64'
                    )}
                >
                    <p className="text-sm text-gray-800">{message}</p>
                    <div className={cn(
                        'absolute w-4 h-4 bg-white border rotate-45',
                        context === 'center-stage'
                            ? '-bottom-2 left-1/2 -translate-x-1/2 border-l border-t border-gray-200'
                            : 'top-full -mt-2 left-4 border-b border-r border-gray-200'
                    )} />
                </motion.div>
            )}
        </div>
    );
}
