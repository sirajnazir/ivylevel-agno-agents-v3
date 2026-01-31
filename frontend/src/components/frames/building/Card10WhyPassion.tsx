'use client';

/**
 * Card 10: Why Passion (Frame 3)
 * Collects: Why this passion, Passion origin (created/joined), Passion reason
 * All fields are OPTIONAL
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudentStore } from '@/lib/store';
import { CardNavigation } from '@/components/layout/AssessmentLayout';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { Heart, Sparkles, Target } from 'lucide-react';
import { FounderGlow, FounderBadge, FounderMessage } from '@/components/effects/FounderGlow';

interface Card10WhyPassionProps {
  onNext: () => void;
  onPrev: () => void;
  currentCard: number;
  totalCards: number;
}

const ORIGIN_OPTIONS: { value: 'created' | 'joined'; label: string; description: string }[] = [
  { value: 'created', label: 'I created this', description: 'Started from scratch or founded something new' },
  { value: 'joined', label: 'I joined existing', description: 'Joined an existing organization or movement' },
];

const REASON_OPTIONS: { value: 'genuine' | 'grew' | 'parents' | 'resume'; label: string; description: string }[] = [
  { value: 'genuine', label: 'Genuine interest', description: 'I was genuinely passionate from the start' },
  { value: 'grew', label: 'Grew on me', description: 'Started casually, became deeply invested' },
  { value: 'parents', label: 'Parent influence', description: 'Parents encouraged or introduced me' },
  { value: 'resume', label: 'Resume building', description: 'Honestly, it looked good for college' },
];

export function Card10WhyPassion({
  onNext,
  onPrev,
  currentCard,
  totalCards,
}: Card10WhyPassionProps) {
  const profile = useStudentStore((s) => s.profile);
  const updatePassion = useStudentStore((s) => s.updatePassion);

  const spikeLabel = profile.passion.spike_category
    ? {
      RESEARCH: 'research',
      LEADER: 'leadership',
      SERVICE: 'service',
      CREATE: 'creating',
      BUSINESS: 'entrepreneurship',
      SPORTS: 'athletics',
      FIGURING: 'your interests',
    }[profile.passion.spike_category]
    : 'your passion';

  const [whyPassion, setWhyPassion] = useState<string>(
    profile.passion.why_passion || ''
  );
  const [passionOrigin, setPassionOrigin] = useState<'created' | 'joined' | null>(
    profile.passion.passion_origin || null
  );
  const [passionReason, setPassionReason] = useState<'genuine' | 'grew' | 'parents' | 'resume' | null>(
    profile.passion.passion_reason || null
  );

  // Auto-save to store on change
  useEffect(() => {
    if (whyPassion) {
      updatePassion('why_passion', whyPassion);
    }
  }, [whyPassion, updatePassion]);

  useEffect(() => {
    if (passionOrigin) {
      updatePassion('passion_origin', passionOrigin);
    }
  }, [passionOrigin, updatePassion]);

  useEffect(() => {
    if (passionReason) {
      updatePassion('passion_reason', passionReason);
    }
  }, [passionReason, updatePassion]);

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
          Why This Matters to You
        </h2>
        <p className="text-base" style={{ color: BRAND_COLORS.textSecondary }}>
          The story behind your passion reveals authenticity
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
        {/* Question 1: Why this passion? */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              What drives your passion for {spikeLabel}? (optional)
            </label>
          </div>
          <p className="text-xs mb-3" style={{ color: BRAND_COLORS.textMuted }}>
            Tell us the real story - why does this matter to you?
          </p>
          <textarea
            value={whyPassion}
            onChange={(e) => setWhyPassion(e.target.value)}
            placeholder={`e.g., "I love ${spikeLabel} because it lets me..." or "I care about this because..."`}
            rows={4}
            className="w-full p-3 rounded-xl text-sm resize-none"
            style={{
              border: `1px solid ${BRAND_COLORS.borderLight}`,
              color: BRAND_COLORS.textPrimary,
            }}
          />
          <p className="text-xs mt-2" style={{ color: BRAND_COLORS.textMuted }}>
            {whyPassion.length} characters
          </p>
          {whyPassion.length >= 50 && (
            <div
              className="mt-3 p-3 rounded-lg text-xs"
              style={{
                backgroundColor: BRAND_COLORS.bgSuccess,
                color: BRAND_COLORS.textPrimary,
              }}
            >
              ✨ Great! Your "why" helps colleges understand your authentic motivation.
            </div>
          )}
        </div>

        {/* Question 2: Did you create or join? */}
        <FounderGlow active={passionOrigin === 'created'}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
              <label
                className="text-sm font-medium"
                style={{ color: BRAND_COLORS.textHeading }}
              >
                How did you start? (optional)
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ORIGIN_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPassionOrigin(option.value)}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor:
                      passionOrigin === option.value
                        ? BRAND_COLORS.primaryBg
                        : 'white',
                    border: `2px solid ${passionOrigin === option.value
                        ? BRAND_COLORS.primary
                        : BRAND_COLORS.borderLight
                      }`,
                  }}
                >
                  <div
                    className="text-sm font-medium mb-1"
                    style={{
                      color:
                        passionOrigin === option.value
                          ? BRAND_COLORS.primary
                          : BRAND_COLORS.textPrimary,
                    }}
                  >
                    {option.label}
                  </div>
                  <div className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                    {option.description}
                  </div>
                </button>
              ))}
            </div>

            {/* Founder Badge */}
            <FounderBadge visible={passionOrigin === 'created'} />

            {/* Founder Message */}
            <FounderMessage visible={passionOrigin === 'created'} />
          </div>
        </FounderGlow>

        {/* Question 3: Why? (Reason) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              Why did you get involved? (optional)
            </label>
          </div>
          <p className="text-xs mb-3" style={{ color: BRAND_COLORS.textMuted }}>
            Be honest - there's no wrong answer
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {REASON_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setPassionReason(option.value)}
                className="p-3 rounded-lg text-left transition-all"
                style={{
                  backgroundColor:
                    passionReason === option.value
                      ? BRAND_COLORS.primaryBg
                      : 'white',
                  border: `1px solid ${passionReason === option.value
                      ? BRAND_COLORS.primary
                      : BRAND_COLORS.borderLight
                    }`,
                }}
              >
                <div
                  className="text-sm font-medium mb-1"
                  style={{
                    color:
                      passionReason === option.value
                        ? BRAND_COLORS.primary
                        : BRAND_COLORS.textPrimary,
                  }}
                >
                  {option.label}
                </div>
                <div className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>
          {passionReason === 'genuine' && (
            <p className="text-xs mt-3" style={{ color: BRAND_COLORS.textMuted }}>
              ✨ Genuine passion is the strongest foundation for a compelling application narrative.
            </p>
          )}
          {passionReason === 'grew' && (
            <p className="text-xs mt-3" style={{ color: BRAND_COLORS.textMuted }}>
              💡 Growth stories show your capacity for strategic evolution - this can be a great essay topic!
            </p>
          )}
          {passionReason === 'resume' && (
            <p className="text-xs mt-3" style={{ color: BRAND_COLORS.textMuted }}>
              📝 Honesty appreciated! Consider how you can reframe this with genuine interest for your essays.
            </p>
          )}
        </div>

        {/* Optional Context Note */}
        <div
          className="p-3 rounded-lg text-xs"
          style={{
            backgroundColor: BRAND_COLORS.bgSuccess,
            color: BRAND_COLORS.textSecondary,
          }}
        >
          💬 Understanding your motivation helps us craft authentic application narratives.
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
