'use client';

/**
 * Card 11: Why Service (Frame 3)
 * Collects: Why this cause, Personal connection to service
 * All fields are OPTIONAL
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudentStore } from '@/lib/store';
import { CardNavigation } from '@/components/layout/AssessmentLayout';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { Heart, MessageCircle } from 'lucide-react';

interface Card11WhyServiceProps {
  onNext: () => void;
  onPrev: () => void;
  currentCard: number;
  totalCards: number;
}

export function Card11WhyService({
  onNext,
  onPrev,
  currentCard,
  totalCards,
}: Card11WhyServiceProps) {
  const profile = useStudentStore((s) => s.profile);
  const updateCommunity = useStudentStore((s) => s.updateCommunity);

  const [whyService, setWhyService] = useState<string>(
    profile.community.why_service || ''
  );
  const [personalConnection, setPersonalConnection] = useState<string>(
    profile.community.service_personal_connection || ''
  );
  const [showPersonalConnection, setShowPersonalConnection] = useState<boolean>(
    (profile.community.service_personal_connection?.length ?? 0) > 0
  );

  // Auto-save to store on change
  useEffect(() => {
    if (whyService) {
      updateCommunity('why_service', whyService);
    }
  }, [whyService, updateCommunity]);

  useEffect(() => {
    if (personalConnection) {
      updateCommunity('service_personal_connection', personalConnection);
    }
  }, [personalConnection, updateCommunity]);

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
          Why You Serve
        </h2>
        <p className="text-base" style={{ color: BRAND_COLORS.textSecondary }}>
          Personal connections make service stories powerful
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
        {/* Question 1: Why do you care? */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              Why do you care about this cause? (optional)
            </label>
          </div>
          <p className="text-xs mb-3" style={{ color: BRAND_COLORS.textMuted }}>
            What motivates you to give your time to this work?
          </p>
          <textarea
            value={whyService}
            onChange={(e) => setWhyService(e.target.value)}
            placeholder="e.g., 'I volunteer at the food bank because...' or 'Education equity matters to me because...'"
            rows={4}
            className="w-full p-3 rounded-xl text-sm resize-none"
            style={{
              border: `1px solid ${BRAND_COLORS.borderLight}`,
              color: BRAND_COLORS.textPrimary,
            }}
          />
          <p className="text-xs mt-2" style={{ color: BRAND_COLORS.textMuted }}>
            {whyService.length} characters
          </p>
          {whyService.length >= 40 && (
            <div
              className="mt-3 p-3 rounded-lg text-xs"
              style={{
                backgroundColor: BRAND_COLORS.bgSuccess,
                color: BRAND_COLORS.textPrimary,
              }}
            >
              ✨ Great! Your "why" adds depth to your service activities.
            </div>
          )}
        </div>

        {/* Question 2: Is this personal? */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              Is this cause personal to you? (optional)
            </label>
          </div>
          <p className="text-xs mb-3" style={{ color: BRAND_COLORS.textMuted }}>
            Personal stories create the most compelling essays
          </p>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setShowPersonalConnection(true)}
              className="flex-1 p-3 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: showPersonalConnection
                  ? BRAND_COLORS.primaryBg
                  : 'white',
                border: `2px solid ${
                  showPersonalConnection
                    ? BRAND_COLORS.primary
                    : BRAND_COLORS.borderLight
                }`,
                color: showPersonalConnection
                  ? BRAND_COLORS.primary
                  : BRAND_COLORS.textPrimary,
              }}
            >
              Yes, it's personal
            </button>
            <button
              onClick={() => {
                setShowPersonalConnection(false);
                setPersonalConnection('');
              }}
              className="flex-1 p-3 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: !showPersonalConnection && personalConnection === ''
                  ? BRAND_COLORS.primaryBg
                  : 'white',
                border: `2px solid ${
                  !showPersonalConnection && personalConnection === ''
                    ? BRAND_COLORS.primary
                    : BRAND_COLORS.borderLight
                }`,
                color: !showPersonalConnection && personalConnection === ''
                  ? BRAND_COLORS.primary
                  : BRAND_COLORS.textPrimary,
              }}
            >
              Not particularly personal
            </button>
          </div>

          {/* Conditional: Personal connection details */}
          {showPersonalConnection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <label
                className="text-sm font-medium mb-3 block"
                style={{ color: BRAND_COLORS.textHeading }}
              >
                Tell us about your personal connection (optional)
              </label>
              <textarea
                value={personalConnection}
                onChange={(e) => setPersonalConnection(e.target.value)}
                placeholder="e.g., 'My family immigrated here and struggled with...' or 'I have a sibling with...'"
                rows={3}
                className="w-full p-3 rounded-xl text-sm resize-none"
                style={{
                  border: `1px solid ${BRAND_COLORS.borderLight}`,
                  color: BRAND_COLORS.textPrimary,
                }}
              />
              {personalConnection.length >= 30 && (
                <div
                  className="mt-3 p-3 rounded-lg text-xs"
                  style={{
                    backgroundColor: BRAND_COLORS.bgSuccess,
                    color: BRAND_COLORS.textPrimary,
                  }}
                >
                  ✨ Personal narratives are essay gold. This connection makes your service authentic.
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Context about service essays */}
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: 'rgba(100, 20, 50, 0.05)',
            border: `1px solid ${BRAND_COLORS.borderLight}`,
          }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: BRAND_COLORS.textHeading }}>
            💡 Essay Tip
          </p>
          <p className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>
            The best service essays don't just list hours - they reveal WHY you care and HOW it changed you.
            Personal connections and authentic motivations make your story stand out.
          </p>
        </div>

        {/* Privacy reassurance */}
        <div
          className="p-3 rounded-lg text-xs"
          style={{
            backgroundColor: BRAND_COLORS.bgSuccess,
            color: BRAND_COLORS.textSecondary,
          }}
        >
          🔒 These reflections help us guide your essay strategy. You control what you share in applications.
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
