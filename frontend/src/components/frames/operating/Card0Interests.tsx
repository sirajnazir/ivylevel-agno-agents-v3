'use client';

/**
 * Card 0: Interests & Strengths (Frame 4)
 * Collects: Favorite Subject, Career Direction, and Top Strengths
 * These are CRITICAL for game plan and narrative generation.
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudentStore } from '@/lib/store';
import { CardNavigation } from '@/components/layout/AssessmentLayout';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { BookOpen, Target, Sparkles, Check } from 'lucide-react';
import { STRENGTH_OPTIONS } from '@/lib/constants/icons'; // Assuming this exists or I'll define local

const SUBJECT_OPTIONS = [
    'Math',
    'Science (Biology, Chemistry, Physics)',
    'English / Literature',
    'History / Social Studies',
    'Computer Science',
    'Arts (Music, Visual Arts, etc.)',
    'Foreign Language',
    'Not sure / I like them all equally',
];

const STRENGTH_ITEMS = [
    { id: 'memorization', label: 'Memorization & Recall' },
    { id: 'hands-on', label: 'Building / Hands-on' },
    { id: 'explaining', label: 'Explaining to Others' },
    { id: 'competitive', label: 'Competitive Drive' },
    { id: 'social', label: 'Connecting with People' },
    { id: 'creative', label: 'Creative Problem-Solving' },
    { id: 'analytical', label: 'Math / Logic / Patterns' },
    { id: 'disciplined', label: 'Discipline & Consistency' },
    { id: 'curious', label: 'Curiosity & Questioning' },
    { id: 'writing', label: 'Writing & Storytelling' },
];

interface Card0InterestsProps {
    onNext: () => void;
    onPrev: () => void;
    currentCard: number;
    totalCards: number;
}

export function Card0Interests({
    onNext,
    onPrev,
    currentCard,
    totalCards,
}: Card0InterestsProps) {
    const profile = useStudentStore((s) => s.profile);
    const updateOperating = useStudentStore((s) => s.updateOperating);

    const [favoriteSubject, setFavoriteSubject] = useState<string>(
        profile.operating?.favoriteSubject || ''
    );
    const [careerDirection, setCareerDirection] = useState<'yes' | 'exploring' | 'no-idea'>(
        profile.operating?.careerDirection || 'exploring'
    );
    const [careerInterest, setCareerInterest] = useState<string>(
        profile.operating?.careerInterest || ''
    );
    const [selectedStrengths, setSelectedStrengths] = useState<string[]>(
        profile.operating?.strengths || []
    );

    // Auto-save to store
    useEffect(() => {
        if (favoriteSubject) updateOperating('favoriteSubject', favoriteSubject);
    }, [favoriteSubject, updateOperating]);

    useEffect(() => {
        updateOperating('careerDirection', careerDirection);
    }, [careerDirection, updateOperating]);

    useEffect(() => {
        if (careerInterest) updateOperating('careerInterest', careerInterest);
    }, [careerInterest, updateOperating]);

    useEffect(() => {
        if (selectedStrengths.length > 0) updateOperating('strengths', selectedStrengths);
    }, [selectedStrengths, updateOperating]);

    const toggleStrength = (id: string) => {
        if (selectedStrengths.includes(id)) {
            setSelectedStrengths(selectedStrengths.filter((s) => s !== id));
        } else if (selectedStrengths.length < 3) {
            setSelectedStrengths([...selectedStrengths, id]);
        }
    };

    const canProgress = favoriteSubject !== '' && selectedStrengths.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="text-center">
                <h2
                    className="text-2xl md:text-3xl font-bold mb-2"
                    style={{ color: BRAND_COLORS.textHeading }}
                >
                    Your Edge
                </h2>
                <p className="text-base" style={{ color: BRAND_COLORS.textSecondary }}>
                    Tell us what drives you and where you excel
                </p>
            </div>

            <div
                className="rounded-2xl p-6 md:p-8 space-y-8"
                style={{
                    backgroundColor: 'white',
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                }}
            >
                {/* Favorite Subject */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
                        <label className="text-sm font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                            Favorite School Subject
                        </label>
                    </div>
                    <select
                        value={favoriteSubject}
                        onChange={(e) => setFavoriteSubject(e.target.value)}
                        className="w-full p-3 rounded-xl text-sm border-2 transition-all outline-none"
                        style={{
                            borderColor: favoriteSubject ? BRAND_COLORS.primary : BRAND_COLORS.borderLight,
                            backgroundColor: BRAND_COLORS.bgPrimary,
                        }}
                    >
                        <option value="">Select a subject...</option>
                        {SUBJECT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Career Direction */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
                        <label className="text-sm font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                            Career Direction
                        </label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { id: 'yes', label: 'Have Ideas' },
                            { id: 'exploring', label: 'Exploring' },
                            { id: 'no-idea', label: 'No Idea Yet' },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setCareerDirection(opt.id as any)}
                                className="p-3 rounded-xl text-sm font-medium transition-all border-2"
                                style={{
                                    backgroundColor: careerDirection === opt.id ? BRAND_COLORS.primaryBg : 'white',
                                    borderColor: careerDirection === opt.id ? BRAND_COLORS.primary : BRAND_COLORS.borderLight,
                                    color: careerDirection === opt.id ? BRAND_COLORS.primary : BRAND_COLORS.textSecondary,
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {careerDirection === 'yes' && (
                        <input
                            type="text"
                            value={careerInterest}
                            onChange={(e) => setCareerInterest(e.target.value)}
                            placeholder="e.g. Neural Engineering, International Law..."
                            className="w-full mt-3 p-3 rounded-xl text-sm border-2 outline-none"
                            style={{ borderColor: BRAND_COLORS.primary }}
                        />
                    )}
                </div>

                {/* Strengths */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
                        <label className="text-sm font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                            Natural Strengths (Select top 2-3)
                        </label>
                    </div>
                    <p className="text-xs mb-4" style={{ color: BRAND_COLORS.textMuted }}>
                        These help us determine your unique "spike"
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {STRENGTH_ITEMS.map((item) => {
                            const isSelected = selectedStrengths.includes(item.id);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => toggleStrength(item.id)}
                                    className="p-3 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between border-2"
                                    style={{
                                        backgroundColor: isSelected ? BRAND_COLORS.primaryBg : 'white',
                                        borderColor: isSelected ? BRAND_COLORS.primary : BRAND_COLORS.borderLight,
                                        color: isSelected ? BRAND_COLORS.primary : BRAND_COLORS.textSecondary,
                                    }}
                                >
                                    {item.label}
                                    {isSelected && <Check className="w-3 h-3" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <CardNavigation
                currentCard={currentCard}
                totalCards={totalCards}
                onNext={onNext}
                onPrev={onPrev}
                canProgress={canProgress}
                nextLabel="Continue"
                showPrev={true}
            />
        </motion.div>
    );
}
