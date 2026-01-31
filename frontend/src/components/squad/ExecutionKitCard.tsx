'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ExecutionKit } from '@/lib/types/agentState';
import { FileText, CheckSquare, BookOpen, Zap } from 'lucide-react';

interface ExecutionKitCardProps {
    kit: ExecutionKit;
    index: number;
    onSelect?: (kitId: string) => void;
    isSelected?: boolean;
}

const RARITY_STYLES = {
    legendary: {
        gradient: 'from-yellow-400 via-orange-500 to-red-500',
        glow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)',
        border: 'border-yellow-400',
        text: 'text-yellow-600',
        bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    },
    epic: {
        gradient: 'from-purple-400 via-pink-500 to-purple-600',
        glow: '0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.3)',
        border: 'border-purple-400',
        text: 'text-purple-600',
        bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
    },
    rare: {
        gradient: 'from-blue-400 via-cyan-500 to-blue-600',
        glow: '0 0 15px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.2)',
        border: 'border-blue-400',
        text: 'text-blue-600',
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    },
    common: {
        gradient: 'from-gray-400 via-gray-500 to-gray-600',
        glow: '0 0 10px rgba(156, 163, 175, 0.3)',
        border: 'border-gray-400',
        text: 'text-gray-600',
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
    },
};

const RESOURCE_ICONS = {
    template: FileText,
    guide: BookOpen,
    checklist: CheckSquare,
    script: Zap,
};

export function ExecutionKitCard({ kit, index, onSelect, isSelected }: ExecutionKitCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const styles = RARITY_STYLES[kit.rarity];

    return (
        <motion.div
            initial={{ rotateY: 180, opacity: 0, scale: 0.8 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            transition={{
                duration: 0.8,
                delay: index * 0.2,
                type: 'spring',
                stiffness: 100,
            }}
            style={{
                perspective: 1000,
                transformStyle: 'preserve-3d',
            }}
            className="w-full max-w-sm"
        >
            <motion.div
                animate={{
                    rotateY: isFlipped ? 180 : 0,
                }}
                transition={{ duration: 0.6 }}
                style={{
                    transformStyle: 'preserve-3d',
                    position: 'relative',
                    width: '100%',
                    minHeight: 400,
                }}
            >
                {/* FRONT FACE */}
                <motion.div
                    style={{
                        backfaceVisibility: 'hidden',
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                    }}
                    className={`${styles.bg} ${styles.border} border-2 rounded-2xl p-6 cursor-pointer`}
                    onClick={() => setIsFlipped(!isFlipped)}
                    whileHover={{ scale: 1.02 }}
                    animate={{
                        boxShadow: [styles.glow, styles.glow.replace(/0\.\d/g, '0.6'), styles.glow],
                    }}
                    transition={{
                        boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                    }}
                >
                    {/* Rarity Badge */}
                    <div className="flex justify-between items-start mb-4">
                        <span className={`${styles.text} text-xs font-bold uppercase tracking-wider`}>
                            {kit.rarity}
                        </span>
                        <span className="text-xs text-gray-500">{kit.timeline}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{kit.title}</h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-6 line-clamp-3">{kit.description}</p>

                    {/* Impact Scores */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {kit.impact_scores.academic && (
                            <div className="bg-white/50 rounded-lg p-2">
                                <div className="text-xs text-gray-500">Academic</div>
                                <div className="text-lg font-bold text-blue-600">+{kit.impact_scores.academic}</div>
                            </div>
                        )}
                        {kit.impact_scores.ec && (
                            <div className="bg-white/50 rounded-lg p-2">
                                <div className="text-xs text-gray-500">EC Impact</div>
                                <div className="text-lg font-bold text-green-600">+{kit.impact_scores.ec}</div>
                            </div>
                        )}
                        {kit.impact_scores.leadership && (
                            <div className="bg-white/50 rounded-lg p-2">
                                <div className="text-xs text-gray-500">Leadership</div>
                                <div className="text-lg font-bold text-purple-600">+{kit.impact_scores.leadership}</div>
                            </div>
                        )}
                        {kit.impact_scores.community && (
                            <div className="bg-white/50 rounded-lg p-2">
                                <div className="text-xs text-gray-500">Community</div>
                                <div className="text-lg font-bold text-orange-600">+{kit.impact_scores.community}</div>
                            </div>
                        )}
                    </div>

                    {/* Resources Count */}
                    <div className="text-sm text-gray-500 mb-4">
                        {kit.resources.length} resources included
                    </div>

                    {/* Click to Flip */}
                    <div className="text-center text-xs text-gray-400 mt-auto">
                        Click to view resources →
                    </div>
                </motion.div>

                {/* BACK FACE */}
                <motion.div
                    style={{
                        backfaceVisibility: 'hidden',
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        transform: 'rotateY(180deg)',
                    }}
                    className={`${styles.bg} ${styles.border} border-2 rounded-2xl p-6 cursor-pointer overflow-y-auto`}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Included Resources</h4>

                    <div className="space-y-3">
                        {kit.resources.map((resource, idx) => {
                            const Icon = RESOURCE_ICONS[resource.type] || FileText;
                            return (
                                <div key={idx} className="bg-white/70 rounded-lg p-3 flex items-start gap-3">
                                    <Icon className={`w-5 h-5 ${styles.text} flex-shrink-0 mt-0.5`} />
                                    <div>
                                        <div className="font-semibold text-sm text-gray-900">{resource.title}</div>
                                        <div className="text-xs text-gray-500 capitalize">{resource.type}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Add to Backpack Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect?.(kit.id);
                        }}
                        className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition-all ${isSelected
                                ? 'bg-green-500 hover:bg-green-600'
                                : `bg-gradient-to-r ${styles.gradient} hover:opacity-90`
                            }`}
                    >
                        {isSelected ? '✓ Added to Backpack' : 'Add to Backpack'}
                    </button>

                    <div className="text-center text-xs text-gray-400 mt-4">
                        ← Click to flip back
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
