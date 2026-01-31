'use client';

/**
 * Card 6: Challenges & Strengths (Frame 4)
 * Collects: Challenge overcome, Impact of challenge, Languages spoken, Comfort with background
 * All fields are OPTIONAL
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudentStore } from '@/lib/store';
import { CardNavigation } from '@/components/layout/AssessmentLayout';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { Mountain, Languages, CheckCircle } from 'lucide-react';

interface Card6ChallengesProps {
  onNext: () => void;
  onPrev: () => void;
  currentCard: number;
  totalCards: number;
}

const COMMON_LANGUAGES = [
  'English',
  'Spanish',
  'Mandarin',
  'Cantonese',
  'Hindi',
  'Arabic',
  'French',
  'German',
  'Japanese',
  'Korean',
  'Portuguese',
  'Russian',
  'Vietnamese',
  'Tagalog',
  'Italian',
];

export function Card6Challenges({
  onNext,
  onPrev,
  currentCard,
  totalCards,
}: Card6ChallengesProps) {
  const profile = useStudentStore((s) => s.profile);
  const updateOperating = useStudentStore((s) => s.updateOperating);

  const [challengeOvercome, setChallengeOvercome] = useState<string>(
    profile.operating?.challengeOvercome || ''
  );
  const [challengeImpact, setChallengeImpact] = useState<string>(
    profile.operating?.challengeImpact || ''
  );
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>(
    profile.operating?.languagesSpoken || []
  );
  const [customLanguage, setCustomLanguage] = useState<string>('');
  const [comfortableDiscussing, setComfortableDiscussing] = useState<boolean | null>(
    profile.operating?.comfortableDiscussingBackground ?? null
  );

  // Auto-save to store on change
  useEffect(() => {
    if (challengeOvercome) {
      updateOperating('challengeOvercome', challengeOvercome);
    }
  }, [challengeOvercome, updateOperating]);

  useEffect(() => {
    if (challengeImpact) {
      updateOperating('challengeImpact', challengeImpact);
    }
  }, [challengeImpact, updateOperating]);

  useEffect(() => {
    if (languagesSpoken.length > 0) {
      updateOperating('languagesSpoken', languagesSpoken);
      if (languagesSpoken.length === 1) {
        updateOperating('languagePrimary', languagesSpoken[0]);
      }
    }
  }, [languagesSpoken, updateOperating]);

  useEffect(() => {
    if (comfortableDiscussing !== null) {
      updateOperating('comfortableDiscussingBackground', comfortableDiscussing);
    }
  }, [comfortableDiscussing, updateOperating]);

  const toggleLanguage = (lang: string) => {
    if (languagesSpoken.includes(lang)) {
      setLanguagesSpoken(languagesSpoken.filter((l) => l !== lang));
    } else {
      setLanguagesSpoken([...languagesSpoken, lang]);
    }
  };

  const addCustomLanguage = () => {
    if (customLanguage.trim() && !languagesSpoken.includes(customLanguage.trim())) {
      setLanguagesSpoken([...languagesSpoken, customLanguage.trim()]);
      setCustomLanguage('');
    }
  };

  // Can always progress (all fields optional)
  const canProgress = true;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Title */}
      <div className="text-center">
        <h2
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ color: BRAND_COLORS.textHeading }}
        >
          Your Story
        </h2>
        <p className="text-base" style={{ color: BRAND_COLORS.textSecondary }}>
          Challenges and unique strengths that shaped who you are
        </p>
      </div>

      {/* Content Card */}
      <div
        className="rounded-2xl p-6 md:p-8 space-y-6"
        style={{
          backgroundColor: 'white',
          border: `1px solid ${BRAND_COLORS.borderLight}`,
        }}
      >
        {/* Question 1: Challenge Overcome */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Mountain className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              What challenge or obstacle have you overcome? (optional)
            </label>
          </div>
          <p className="text-xs mb-3" style={{ color: BRAND_COLORS.textMuted }}>
            This could be academic, financial, family-related, health, or anything significant
          </p>
          <textarea
            value={challengeOvercome}
            onChange={(e) => setChallengeOvercome(e.target.value)}
            placeholder="e.g., Financial hardship, learning disability, family illness, immigration challenges..."
            rows={3}
            className="w-full p-3 rounded-xl text-sm resize-none"
            style={{
              border: `1px solid ${BRAND_COLORS.borderLight}`,
              color: BRAND_COLORS.textPrimary,
            }}
          />
          <p className="text-xs mt-2" style={{ color: BRAND_COLORS.textMuted }}>
            {challengeOvercome.length} characters
          </p>
        </div>

        {/* Question 2: Challenge Impact (conditional) */}
        {challengeOvercome.length >= 30 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <label
              className="text-sm font-medium mb-3 block"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              How did this challenge shape who you are today? (optional)
            </label>
            <textarea
              value={challengeImpact}
              onChange={(e) => setChallengeImpact(e.target.value)}
              placeholder="e.g., Made me more resilient, taught me to value education, motivated me to help others..."
              rows={3}
              className="w-full p-3 rounded-xl text-sm resize-none"
              style={{
                border: `1px solid ${BRAND_COLORS.borderLight}`,
                color: BRAND_COLORS.textPrimary,
              }}
            />
            {challengeImpact.length >= 30 && (
              <div
                className="mt-3 p-3 rounded-lg text-xs"
                style={{
                  backgroundColor: BRAND_COLORS.bgSuccess,
                  color: BRAND_COLORS.textPrimary,
                }}
              >
                ✨ This is powerful essay material. Your adversity + growth story is compelling.
              </div>
            )}
          </motion.div>
        )}

        {/* Question 3: Languages Spoken */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Languages className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              What languages do you speak? (optional, select all)
            </label>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-3">
            {COMMON_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className="p-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: languagesSpoken.includes(lang)
                    ? BRAND_COLORS.primaryBg
                    : 'white',
                  border: `1px solid ${
                    languagesSpoken.includes(lang)
                      ? BRAND_COLORS.primary
                      : BRAND_COLORS.borderLight
                  }`,
                  color: languagesSpoken.includes(lang)
                    ? BRAND_COLORS.primary
                    : BRAND_COLORS.textSecondary,
                }}
              >
                {lang}
              </button>
            ))}
          </div>
          {/* Custom language input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customLanguage}
              onChange={(e) => setCustomLanguage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomLanguage();
                }
              }}
              placeholder="Other language..."
              className="flex-1 p-2 rounded-lg text-sm"
              style={{
                border: `1px solid ${BRAND_COLORS.borderLight}`,
                color: BRAND_COLORS.textPrimary,
              }}
            />
            <button
              onClick={addCustomLanguage}
              disabled={!customLanguage.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: customLanguage.trim()
                  ? BRAND_COLORS.primary
                  : '#e5e7eb',
                color: customLanguage.trim() ? 'white' : '#9ca3af',
                cursor: customLanguage.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Add
            </button>
          </div>
          {languagesSpoken.length >= 2 && (
            <p className="text-xs mt-2" style={{ color: BRAND_COLORS.textMuted }}>
              ✨ {languagesSpoken.length} languages! Being multilingual is a unique strength.
            </p>
          )}
        </div>

        {/* Question 4: Comfort discussing background */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              Are you comfortable discussing your background in your application? (optional)
            </label>
          </div>
          <p className="text-xs mb-3" style={{ color: BRAND_COLORS.textMuted }}>
            Your identity can be a powerful part of your story if you choose to share it
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setComfortableDiscussing(true)}
              className="flex-1 p-3 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  comfortableDiscussing === true
                    ? BRAND_COLORS.primaryBg
                    : 'white',
                border: `2px solid ${
                  comfortableDiscussing === true
                    ? BRAND_COLORS.primary
                    : BRAND_COLORS.borderLight
                }`,
                color:
                  comfortableDiscussing === true
                    ? BRAND_COLORS.primary
                    : BRAND_COLORS.textPrimary,
              }}
            >
              Yes, I want to share
            </button>
            <button
              onClick={() => setComfortableDiscussing(false)}
              className="flex-1 p-3 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  comfortableDiscussing === false
                    ? BRAND_COLORS.primaryBg
                    : 'white',
                border: `2px solid ${
                  comfortableDiscussing === false
                    ? BRAND_COLORS.primary
                    : BRAND_COLORS.borderLight
                }`,
                color:
                  comfortableDiscussing === false
                    ? BRAND_COLORS.primary
                    : BRAND_COLORS.textPrimary,
              }}
            >
              I prefer to keep it private
            </button>
          </div>
        </div>

        {/* Privacy reassurance */}
        <div
          className="p-3 rounded-lg text-xs"
          style={{
            backgroundColor: BRAND_COLORS.bgSuccess,
            color: BRAND_COLORS.textSecondary,
          }}
        >
          🔒 Everything you share is confidential. You can always skip questions or change your mind later.
        </div>
      </div>

      {/* Navigation */}
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
