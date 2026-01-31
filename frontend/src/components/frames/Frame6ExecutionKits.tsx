'use client';

/**
 * Frame 6: Execution Kit Reveal
 * 
 * The grand finale - legendary loot reveal with rarity-based shimmer effects.
 * Kai celebrates as the squad's personalized execution kits are unveiled.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSquadStore } from '@/lib/store/useSquadStore';
import { useStudentStore } from '@/lib/store/useStudentStore';
import { IvyCoachAvatar } from '@/components/squad';
import { ExecutionKitCard } from '@/components/squad/ExecutionKitCard';
import { Sparkles, Zap } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';

interface Frame6ExecutionKitsProps {
    onComplete?: () => void;
}

export function Frame6ExecutionKits({ onComplete }: Frame6ExecutionKitsProps) {
    const { profile } = useStudentStore();
    const gameplanData = useSquadStore((s) => s.gameplanData);
    const selectedKits = useSquadStore((s) => s.selectedKits);
    const toggleKit = useSquadStore((s) => s.toggleKit);

    const [isForging, setIsForging] = useState(true);
    const [kitsRevealed, setKitsRevealed] = useState(false);

    // Target school for personalized message
    const targetSchool = profile.target_schools?.[0] || 'your dream school';

    // Forge animation (1.5s)
    useEffect(() => {
        const forgeTimer = setTimeout(() => {
            setIsForging(false);
            setKitsRevealed(true);
        }, 1500);

        return () => clearTimeout(forgeTimer);
    }, []);

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#ffffff',
                padding: '40px 20px',
                position: 'relative',
            }}
        >
            {/* Kai in Coach-Corner */}
            <IvyCoachAvatar
                state={kitsRevealed ? 'celebrating' : 'thinking'}
                message={
                    kitsRevealed
                        ? `Your roadmap is ready. These Execution Kits are your keys to ${targetSchool}. Each one was hand-picked by the squad to ensure your success. Let's get to work!`
                        : 'Your experts are forging your personalized Execution Kits...'
                }
                context="coach-corner"
                position="top-right"
            />

            {/* Main Content */}
            <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 60 }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: 48 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                        <Sparkles size={32} style={{ color: BRAND_COLORS.primary }} />
                        <h1
                            style={{
                                fontSize: 36,
                                fontWeight: 800,
                                color: BRAND_COLORS.textHeading,
                                margin: 0,
                            }}
                        >
                            Your Execution Kits
                        </h1>
                        <Sparkles size={32} style={{ color: BRAND_COLORS.primary }} />
                    </div>
                    <p style={{ fontSize: 16, color: BRAND_COLORS.textMuted, maxWidth: 600, margin: '0 auto' }}>
                        Legendary blueprints forged by your expert squad
                    </p>
                </motion.div>

                {/* Forge Animation */}
                <AnimatePresence>
                    {isForging && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                            transition={{ duration: 0.6 }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 400,
                            }}
                        >
                            {/* Pulsing Squad Icons */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 180, 360],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Zap size={64} style={{ color: BRAND_COLORS.primary }} />
                            </motion.div>

                            <motion.p
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{
                                    marginTop: 24,
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: BRAND_COLORS.textHeading,
                                }}
                            >
                                Forging your kits...
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Execution Kits Grid */}
                {!isForging && gameplanData?.execution_kits && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: 32,
                            marginBottom: 48,
                        }}
                    >
                        {gameplanData.execution_kits.map((kit, index) => (
                            <ExecutionKitCard
                                key={kit.id}
                                kit={kit}
                                index={index}
                                onSelect={toggleKit}
                                isSelected={selectedKits.includes(kit.id)}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Empty State */}
                {!isForging && !gameplanData?.execution_kits && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            textAlign: 'center',
                            padding: 60,
                            backgroundColor: 'white',
                            borderRadius: 16,
                            border: `1px solid ${BRAND_COLORS.borderLight}`,
                        }}
                    >
                        <p style={{ fontSize: 16, color: BRAND_COLORS.textMuted }}>
                            No execution kits available yet. Complete your game plan to unlock personalized kits!
                        </p>
                    </motion.div>
                )}

                {/* Continue Button */}
                {kitsRevealed && gameplanData?.execution_kits && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        style={{ textAlign: 'center' }}
                    >
                        <button
                            onClick={onComplete}
                            style={{
                                padding: '16px 48px',
                                fontSize: 18,
                                fontWeight: 700,
                                color: 'white',
                                background: `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary})`,
                                border: 'none',
                                borderRadius: 12,
                                cursor: 'pointer',
                                boxShadow: `0 4px 20px ${BRAND_COLORS.primaryBg}`,
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = `0 6px 30px ${BRAND_COLORS.primaryBg}`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = `0 4px 20px ${BRAND_COLORS.primaryBg}`;
                            }}
                        >
                            Start Your Journey →
                        </button>

                        <p style={{ marginTop: 16, fontSize: 14, color: BRAND_COLORS.textMuted }}>
                            {selectedKits.length} kit{selectedKits.length !== 1 ? 's' : ''} added to your backpack
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
