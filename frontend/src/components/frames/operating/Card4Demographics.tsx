'use client';

/**
 * Card 4: Demographics (Frame 4)
 * Collects: Gender, Cultural Background, First-generation status
 * All fields are OPTIONAL (sensitive information)
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudentStore } from '@/lib/store';
import { CardNavigation } from '@/components/layout/AssessmentLayout';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { Users, Globe, Award } from 'lucide-react';
import type { Gender, Ethnicity } from '@/lib/types/student';

interface Card4DemographicsProps {
  onNext: () => void;
  onPrev: () => void;
  currentCard: number;
  totalCards: number;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'FEMALE', label: 'Female' },
  { value: 'MALE', label: 'Male' },
  { value: 'NON_BINARY', label: 'Non-binary' },
  { value: 'PREFER_NOT_SAY', label: 'Prefer not to say' },
];

const ETHNICITY_OPTIONS: { value: Ethnicity; label: string; category?: string }[] = [
  // Asian sub-ethnicities
  { value: 'SOUTH_ASIAN', label: 'South Asian', category: 'Asian' },
  { value: 'EAST_ASIAN', label: 'East Asian', category: 'Asian' },
  { value: 'SOUTHEAST_ASIAN', label: 'Southeast Asian', category: 'Asian' },
  { value: 'ASIAN', label: 'Asian (other)', category: 'Asian' },
  // Other ethnicities
  { value: 'BLACK', label: 'Black / African American' },
  { value: 'HISPANIC', label: 'Hispanic / Latino' },
  { value: 'WHITE', label: 'White / Caucasian' },
  { value: 'NATIVE', label: 'Native American' },
  { value: 'PACIFIC_ISLANDER', label: 'Pacific Islander' },
  { value: 'MIDDLE_EASTERN', label: 'Middle Eastern' },
  { value: 'MULTIRACIAL', label: 'Multiracial' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_SAY', label: 'Prefer not to say' },
];

export function Card4Demographics({
  onNext,
  onPrev,
  currentCard,
  totalCards,
}: Card4DemographicsProps) {
  const profile = useStudentStore((s) => s.profile);
  const updateOperating = useStudentStore((s) => s.updateOperating);

  const [gender, setGender] = useState<Gender | null>(
    profile.operating?.gender || null
  );
  const [culturalBackground, setCulturalBackground] = useState<Ethnicity[]>(
    profile.operating?.culturalBackground || []
  );
  const [firstGen, setFirstGen] = useState<boolean | null>(
    profile.operating?.firstGeneration ?? null
  );
  const [religion, setReligion] = useState<string>(
    profile.operating?.religion || ''
  );

  // Auto-save to store on change
  useEffect(() => {
    if (gender) updateOperating('gender', gender);
  }, [gender, updateOperating]);

  useEffect(() => {
    if (culturalBackground.length > 0) {
      updateOperating('culturalBackground', culturalBackground);
    }
  }, [culturalBackground, updateOperating]);

  useEffect(() => {
    if (firstGen !== null) updateOperating('firstGeneration', firstGen);
  }, [firstGen, updateOperating]);

  useEffect(() => {
    if (religion) updateOperating('religion', religion);
  }, [religion, updateOperating]);

  const toggleEthnicity = (value: Ethnicity) => {
    if (value === 'PREFER_NOT_SAY') {
      setCulturalBackground([value]);
      return;
    }

    const filtered = culturalBackground.filter((e) => e !== 'PREFER_NOT_SAY');
    if (filtered.includes(value)) {
      setCulturalBackground(filtered.filter((e) => e !== value));
    } else {
      setCulturalBackground([...filtered, value]);
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
          Your Identity
        </h2>
        <p className="text-base" style={{ color: BRAND_COLORS.textSecondary }}>
          Help us understand your background (all optional)
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
        {/* Question 1: Gender */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              Gender (optional)
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setGender(option.value)}
                className="p-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor:
                    gender === option.value
                      ? BRAND_COLORS.primaryBg
                      : 'white',
                  border: `2px solid ${
                    gender === option.value
                      ? BRAND_COLORS.primary
                      : BRAND_COLORS.borderLight
                  }`,
                  color:
                    gender === option.value
                      ? BRAND_COLORS.primary
                      : BRAND_COLORS.textPrimary,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: Cultural Background */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              Cultural Background (optional, select all that apply)
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ETHNICITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleEthnicity(option.value)}
                className="p-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: culturalBackground.includes(option.value)
                    ? BRAND_COLORS.primaryBg
                    : 'white',
                  border: `1px solid ${
                    culturalBackground.includes(option.value)
                      ? BRAND_COLORS.primary
                      : BRAND_COLORS.borderLight
                  }`,
                  color: culturalBackground.includes(option.value)
                    ? BRAND_COLORS.primary
                    : BRAND_COLORS.textSecondary,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 3: First-generation */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              Are you a first-generation college student? (optional)
            </label>
          </div>
          <p className="text-xs mb-3" style={{ color: BRAND_COLORS.textMuted }}>
            Neither parent completed a 4-year college degree
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setFirstGen(true)}
              className="flex-1 p-3 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  firstGen === true
                    ? BRAND_COLORS.primaryBg
                    : 'white',
                border: `2px solid ${
                  firstGen === true
                    ? BRAND_COLORS.primary
                    : BRAND_COLORS.borderLight
                }`,
                color:
                  firstGen === true
                    ? BRAND_COLORS.primary
                    : BRAND_COLORS.textPrimary,
              }}
            >
              Yes, I'm first-gen
            </button>
            <button
              onClick={() => setFirstGen(false)}
              className="flex-1 p-3 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  firstGen === false
                    ? BRAND_COLORS.primaryBg
                    : 'white',
                border: `2px solid ${
                  firstGen === false
                    ? BRAND_COLORS.primary
                    : BRAND_COLORS.borderLight
                }`,
                color:
                  firstGen === false
                    ? BRAND_COLORS.primary
                    : BRAND_COLORS.textPrimary,
              }}
            >
              No
            </button>
          </div>
        </div>

        {/* Question 4: Religion/Faith (NEW) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              Religion / Faith Background (optional)
            </label>
          </div>
          <p className="text-xs mb-3" style={{ color: BRAND_COLORS.textMuted }}>
            Your religious or spiritual identity, if important to your story
          </p>
          <input
            type="text"
            value={religion}
            onChange={(e) => setReligion(e.target.value)}
            placeholder="e.g., Muslim, Christian, Hindu, Jewish, Buddhist, Atheist, etc."
            className="w-full p-3 rounded-xl text-sm border-2 transition-all"
            style={{
              borderColor: religion ? BRAND_COLORS.primary : BRAND_COLORS.borderLight,
              color: BRAND_COLORS.textPrimary,
            }}
          />
        </div>

        {/* Optional Privacy Note */}
        <div
          className="p-3 rounded-lg text-xs"
          style={{
            backgroundColor: BRAND_COLORS.bgSuccess,
            color: BRAND_COLORS.textSecondary,
          }}
        >
          🔒 This information helps us understand your context and is never shared.
          You can skip any question.
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
