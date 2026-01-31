'use client';

/**
 * IvyQuest - Frame 4: Context & Capacity
 *
 * Collects operating data for game plan generation:
 * - Interests (favorite subject, career direction) - Optional
 * - Strengths (top 2-3) - Optional
 * - Context (parent occupation, first-gen, transportation) - MANDATORY
 * - Time capacity (available hours, homework hours) - MANDATORY
 *
 * Also computes psychometrics from collected data before proceeding.
 *
 * @version 1.1.0
 */

import { useState, useCallback } from 'react';
import { useStudentStore } from '@/lib/store/useStudentStore';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { computeTimeManagement } from '@/lib/types/frame4';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Info,
  Check,
  BookOpen,
  FlaskConical,
  MessageCircle,
  Target,
  Users,
  Palette,
  Calculator,
  Clock,
  Search,
  Pencil,
  HelpCircle,
} from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { STRENGTH_ICONS, ICON_COLORS } from '@/lib/constants/icons';
import type { Gender, Ethnicity, ImmigrationStatus } from '@/lib/types/student';

// ============================================================================
// CONSTANTS
// ============================================================================

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

const CAREER_EXCLUSIONS = [
  { id: 'cs', label: 'Computer Science / Tech' },
  { id: 'medicine', label: 'Medicine / Healthcare' },
  { id: 'law', label: 'Law / Politics' },
  { id: 'business', label: 'Business / Finance' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'teaching', label: 'Teaching / Education' },
  { id: 'arts', label: 'Arts / Creative fields' },
];

// Strength options with SVG icons (v11 - replaced emojis)
const STRENGTH_OPTIONS = [
  { id: 'memorization', label: 'Memorization & recall', Icon: BookOpen },
  { id: 'hands-on', label: 'Building/hands-on work', Icon: FlaskConical },
  { id: 'explaining', label: 'Explaining to others', Icon: MessageCircle },
  { id: 'competitive', label: 'Competitive drive', Icon: Target },
  { id: 'social', label: 'Connecting with people', Icon: Users },
  { id: 'creative', label: 'Creative problem-solving', Icon: Palette },
  { id: 'analytical', label: 'Math/logic/patterns', Icon: Calculator },
  { id: 'disciplined', label: 'Discipline & consistency', Icon: Clock },
  { id: 'curious', label: 'Curiosity & questioning', Icon: Search },
  { id: 'writing', label: 'Writing & storytelling', Icon: Pencil },
  { id: 'not-sure', label: 'Not sure yet', Icon: HelpCircle },
];

const OCCUPATION_OPTIONS = [
  'Technology / Software',
  'Healthcare / Medicine',
  'Education / Teaching',
  'Business / Finance',
  'Engineering',
  'Law / Government',
  'Arts / Creative',
  'Service Industry',
  'Retail / Sales',
  'Trades / Manual Labor',
  'Stay-at-home parent',
  'Retired',
  'Other',
  'Prefer not to say',
];

// Background options for narrative synthesis
const CULTURAL_BACKGROUND_OPTIONS = [
  { id: 'SOUTH_ASIAN', label: 'South Asian (Indian, Pakistani, Bangladeshi, etc.)' },
  { id: 'SOUTHEAST_ASIAN', label: 'Southeast Asian (Vietnamese, Filipino, Thai, etc.)' },
  { id: 'ASIAN', label: 'East Asian (Chinese, Korean, Japanese, etc.)' },
  { id: 'MIDDLE_EASTERN', label: 'Middle Eastern / North African' },
  { id: 'BLACK', label: 'Black / African American' },
  { id: 'HISPANIC', label: 'Hispanic / Latino' },
  { id: 'WHITE', label: 'White / Caucasian' },
  { id: 'NATIVE', label: 'Native American / Indigenous' },
  { id: 'PACIFIC_ISLANDER', label: 'Pacific Islander' },
  { id: 'MULTIRACIAL', label: 'Mixed / Multiracial' },
  { id: 'OTHER', label: 'Other' },
  { id: 'PREFER_NOT_SAY', label: 'Prefer not to say' },
];

const GENDER_OPTIONS = [
  { id: 'FEMALE', label: 'Female' },
  { id: 'MALE', label: 'Male' },
  { id: 'NON_BINARY', label: 'Non-binary' },
  { id: 'PREFER_NOT_SAY', label: 'Prefer not to say' },
];

const IMMIGRATION_OPTIONS = [
  { id: 'FIRST_GEN_IMMIGRANT', label: "Yes, I'm a first-generation immigrant" },
  { id: 'PARENTS_IMMIGRATED', label: 'Yes, my parents immigrated' },
  { id: 'NO', label: 'No' },
  { id: 'PREFER_NOT_SAY', label: 'Prefer not to say' },
];

// ============================================================================
// INTERFACES
// ============================================================================

interface Frame4ContextProps {
  onComplete?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Frame4Context({ onComplete }: Frame4ContextProps) {
  const { profile, updateOperating, calculateCompleteness, setPsychometrics, setAssessmentIntelligence } = useStudentStore();
  const { nextFrame, completeFrame } = useSessionStore();
  const [currentSection, setCurrentSection] = useState<number>(0);

  // Get operating data with defaults
  const operating = profile.operating || {};

  // ============================================================================
  // DERIVE PSYCHOMETRICS FROM STRENGTHS
  // ============================================================================

  /**
   * Maps selected strengths to psychometric dimensions.
   * This provides better-than-default values based on user selections.
   */
  const deriveFromStrengths = useCallback((strengths: string[]): Record<string, number> => {
    // Start with neutral 0.5 baseline
    const scores: Record<string, number> = {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
      grit_resilience: 0.5,
      coachability_score: 0.5,
    };

    // Strength to psychometric mapping
    const strengthMappings: Record<string, Partial<typeof scores>> = {
      'memorization': { conscientiousness: 0.1, grit_resilience: 0.05 },
      'hands-on': { openness: 0.1, conscientiousness: 0.05 },
      'explaining': { extraversion: 0.15, agreeableness: 0.1 },
      'competitive': { agreeableness: -0.1, grit_resilience: 0.15, neuroticism: 0.05 },
      'social': { extraversion: 0.2, agreeableness: 0.1 },
      'creative': { openness: 0.2, neuroticism: -0.05 },
      'analytical': { conscientiousness: 0.15, openness: 0.1 },
      'disciplined': { conscientiousness: 0.2, grit_resilience: 0.15, neuroticism: -0.1 },
      'curious': { openness: 0.2, coachability_score: 0.1 },
      'writing': { openness: 0.15, conscientiousness: 0.05 },
    };

    // Apply impacts from each selected strength
    for (const strength of strengths) {
      const mapping = strengthMappings[strength];
      if (mapping) {
        for (const [dimension, impact] of Object.entries(mapping)) {
          scores[dimension] = Math.max(0, Math.min(1, scores[dimension] + (impact || 0)));
        }
      }
    }

    return scores;
  }, []);

  // ============================================================================
  // SECTION 1: INTERESTS
  // ============================================================================
  const renderInterestsSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Why we ask */}
      <div
        className="p-4 rounded-lg border-l-4"
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderLeftColor: '#3b82f6',
        }}
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#3b82f6' }} />
          <div>
            <h3 className="font-semibold mb-1" style={{ color: '#1e40af' }}>
              Why we ask about interests
            </h3>
            <p className="text-sm" style={{ color: '#1e3a8a' }}>
              Understanding what drives you helps us recommend activities you'll actually
              enjoy and stick with. Even "not sure yet" is a valid answer!
            </p>
          </div>
        </div>
      </div>

      {/* Q1: Favorite Subject */}
      <div className="space-y-3">
        <label className="block text-lg font-medium" style={{ color: BRAND_COLORS.textHeading }}>
          What's your favorite subject in school?
        </label>
        <select
          value={operating.favoriteSubject || ''}
          onChange={(e) => updateOperating('favoriteSubject', e.target.value || null)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:outline-none"
          style={{
            borderColor: BRAND_COLORS.borderLight,
            backgroundColor: BRAND_COLORS.bgPrimary,
          }}
        >
          <option value="">Select a subject...</option>
          {SUBJECT_OPTIONS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Follow-up: Why do you like it? */}
      <AnimatePresence>
        {operating.favoriteSubject &&
          operating.favoriteSubject !== 'Not sure / I like them all equally' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <label className="block text-sm font-medium" style={{ color: BRAND_COLORS.textPrimary }}>
                What do you like about it? (Optional)
              </label>
              <textarea
                value={operating.favoriteSubjectReason || ''}
                onChange={(e) => updateOperating('favoriteSubjectReason', e.target.value || null)}
                placeholder="E.g., 'I love how biology shows how everything in nature is connected...'"
                maxLength={150}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:outline-none resize-none"
                style={{ borderColor: BRAND_COLORS.borderLight }}
                rows={3}
              />
              <p className="text-xs text-right" style={{ color: BRAND_COLORS.textMuted }}>
                {(operating.favoriteSubjectReason || '').length}/150
              </p>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Q2: Career Direction */}
      <div className="space-y-3 pt-4">
        <label className="block text-lg font-medium" style={{ color: BRAND_COLORS.textHeading }}>
          Do you have any idea what you might want to do as a career?
        </label>
        <div className="space-y-2">
          {[
            { value: 'yes', label: 'Yes, I have some ideas' },
            { value: 'exploring', label: 'Still exploring' },
            { value: 'no-idea', label: "No idea at all - that's okay!" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
              style={{ borderColor: BRAND_COLORS.borderLight }}
            >
              <input
                type="radio"
                name="careerDirection"
                value={option.value}
                checked={operating.careerDirection === option.value}
                onChange={(e) => updateOperating('careerDirection', e.target.value as 'yes' | 'exploring' | 'no-idea')}
                className="w-4 h-4"
                style={{ accentColor: BRAND_COLORS.primary }}
              />
              <span style={{ color: BRAND_COLORS.textPrimary }}>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Follow-up: What interests you? */}
      <AnimatePresence>
        {operating.careerDirection === 'yes' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <label className="block text-sm font-medium" style={{ color: BRAND_COLORS.textPrimary }}>
              What career(s) interest you?
            </label>
            <input
              type="text"
              value={operating.careerInterest || ''}
              onChange={(e) => updateOperating('careerInterest', e.target.value || null)}
              placeholder="E.g., 'Doctor, scientist, engineer...'"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:outline-none"
              style={{ borderColor: BRAND_COLORS.borderLight }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encouragement for exploring */}
      <AnimatePresence>
        {(operating.careerDirection === 'exploring' || operating.careerDirection === 'no-idea') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderColor: 'rgba(34, 197, 94, 0.3)',
            }}
          >
            <p className="text-sm" style={{ color: '#166534' }}>
              ✓ Perfect timing to explore! We'll help you discover your direction through
              strategic activities and exploration projects.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Q3: Career Exclusions */}
      <div className="space-y-3 pt-4">
        <label className="block text-lg font-medium" style={{ color: BRAND_COLORS.textHeading }}>
          Are there any careers you're pretty sure you DON'T want?
        </label>
        <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
          (This helps us understand your values. Select all that apply)
        </p>
        <div className="space-y-2">
          {CAREER_EXCLUSIONS.map((career) => (
            <label
              key={career.id}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
              style={{ borderColor: BRAND_COLORS.borderLight }}
            >
              <input
                type="checkbox"
                checked={(operating.careerExclusions || []).includes(career.id)}
                onChange={(e) => {
                  const current = operating.careerExclusions || [];
                  const updated = e.target.checked
                    ? [...current, career.id]
                    : current.filter((id) => id !== career.id);
                  updateOperating('careerExclusions', updated);
                }}
                className="w-4 h-4 rounded"
                style={{ accentColor: BRAND_COLORS.primary }}
              />
              <span style={{ color: BRAND_COLORS.textPrimary }}>{career.label}</span>
            </label>
          ))}
          <label
            className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
            style={{ borderColor: BRAND_COLORS.borderLight }}
          >
            <input
              type="checkbox"
              checked={(operating.careerExclusions || []).includes('none')}
              onChange={(e) => {
                updateOperating('careerExclusions', e.target.checked ? ['none'] : []);
              }}
              className="w-4 h-4 rounded"
              style={{ accentColor: BRAND_COLORS.primary }}
            />
            <span style={{ color: BRAND_COLORS.textPrimary }}>None - I'm open to everything</span>
          </label>
        </div>
      </div>
    </motion.div>
  );

  // ============================================================================
  // SECTION 2: STRENGTHS
  // ============================================================================
  const renderStrengthsSection = () => {
    const selectedStrengths = operating.strengths || [];
    const selectedCount = selectedStrengths.length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        {/* Why we ask */}
        <div
          className="p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
            borderLeftColor: '#9333ea',
          }}
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#9333ea' }} />
            <div>
              <h3 className="font-semibold mb-1" style={{ color: '#581c87' }}>
                Why we ask about strengths
              </h3>
              <p className="text-sm" style={{ color: '#581c87' }}>
                Top schools want students with clear "spikes" - areas where you excel.
                We'll help you build activities around what you're naturally good at.
              </p>
            </div>
          </div>
        </div>

        {/* Q4: Select Top Strengths */}
        <div className="space-y-3">
          <label className="block text-lg font-medium" style={{ color: BRAND_COLORS.textHeading }}>
            What are you naturally good at? (Select your top 2-3)
          </label>
          <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
            Don't be modest - this helps us recommend the right activities for YOU.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STRENGTH_OPTIONS.map((strength) => {
              const isSelected = selectedStrengths.includes(strength.id);
              const canSelect = selectedCount < 3 || isSelected;

              return (
                <button
                  key={strength.id}
                  onClick={() => {
                    const updated = isSelected
                      ? selectedStrengths.filter((id) => id !== strength.id)
                      : canSelect
                        ? [...selectedStrengths, strength.id]
                        : selectedStrengths;
                    updateOperating('strengths', updated);
                  }}
                  disabled={!canSelect && !isSelected}
                  className="flex items-center gap-3 p-4 border-2 rounded-lg text-left transition-all"
                  style={{
                    borderColor: isSelected ? BRAND_COLORS.primary : BRAND_COLORS.borderLight,
                    backgroundColor: isSelected ? `${BRAND_COLORS.primary}10` : 'white',
                    opacity: !canSelect && !isSelected ? 0.5 : 1,
                    cursor: !canSelect && !isSelected ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: isSelected ? BRAND_COLORS.primaryBg : 'rgba(0,0,0,0.05)',
                    }}
                  >
                    <strength.Icon
                      size={20}
                      style={{ color: isSelected ? BRAND_COLORS.primary : BRAND_COLORS.textMuted }}
                    />
                  </div>
                  <span className="flex-1 font-medium" style={{ color: BRAND_COLORS.textPrimary }}>
                    {strength.label}
                  </span>
                  {isSelected && (
                    <Check className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
            Selected: {selectedCount}/3
          </p>
        </div>

        {/* Follow-up: Example */}
        <AnimatePresence>
          {selectedStrengths.length > 0 && !selectedStrengths.includes('not-sure') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pt-4"
            >
              <label className="block text-sm font-medium" style={{ color: BRAND_COLORS.textPrimary }}>
                Give a quick example of when you used your strength (Optional)
              </label>
              <textarea
                value={operating.strengthExample || ''}
                onChange={(e) => updateOperating('strengthExample', e.target.value || null)}
                placeholder="E.g., 'I memorized all 206 bones for Science Olympiad in 2 weeks...'"
                maxLength={200}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:outline-none resize-none"
                style={{ borderColor: BRAND_COLORS.borderLight }}
                rows={3}
              />
              <p className="text-xs text-right" style={{ color: BRAND_COLORS.textMuted }}>
                {(operating.strengthExample || '').length}/200
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Encouragement for "not sure" */}
        <AnimatePresence>
          {selectedStrengths.includes('not-sure') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
              }}
            >
              <p className="text-sm" style={{ color: '#1e40af' }}>
                ✓ That's okay! We'll help you discover your edge through activities and coaching.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // ============================================================================
  // SECTION 3: CONTEXT (MANDATORY)
  // ============================================================================
  const renderContextSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Why we ask */}
      <div
        className="p-4 rounded-lg border-l-4"
        style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderLeftColor: '#f59e0b',
        }}
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
          <div>
            <h3 className="font-semibold mb-1" style={{ color: '#92400e' }}>
              Why we ask about your background
            </h3>
            <p className="text-sm" style={{ color: '#92400e' }}>
              Your background is part of your unique story. Admissions officers evaluate you
              relative to your opportunities and context. This helps us craft a narrative
              that authentically represents who you are.
            </p>
          </div>
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-3">
        <label className="block text-sm font-medium" style={{ color: BRAND_COLORS.textHeading }}>
          Gender
        </label>
        <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
          (Helps match you with relevant scholarships and opportunities)
        </p>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => updateOperating('gender', option.id as Gender)}
              className="px-4 py-2 border-2 rounded-full text-sm font-medium transition-all"
              style={{
                borderColor: operating.gender === option.id ? BRAND_COLORS.primary : BRAND_COLORS.borderLight,
                backgroundColor: operating.gender === option.id ? `${BRAND_COLORS.primary}10` : 'white',
                color: operating.gender === option.id ? BRAND_COLORS.primary : BRAND_COLORS.textPrimary,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cultural Background */}
      <div className="space-y-3">
        <label className="block text-sm font-medium" style={{ color: BRAND_COLORS.textHeading }}>
          How would you describe your cultural background?
        </label>
        <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
          (Select all that apply - this helps personalize your narrative)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {CULTURAL_BACKGROUND_OPTIONS.map((option) => {
            const isSelected = (operating.culturalBackground || []).includes(option.id as Ethnicity);
            return (
              <label
                key={option.id}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                style={{
                  borderColor: isSelected ? BRAND_COLORS.primary : BRAND_COLORS.borderLight,
                  backgroundColor: isSelected ? `${BRAND_COLORS.primary}08` : 'white',
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    const current = operating.culturalBackground || [];
                    // If selecting "Prefer not to say", clear others
                    if (option.id === 'PREFER_NOT_SAY' && e.target.checked) {
                      updateOperating('culturalBackground', ['PREFER_NOT_SAY'] as Ethnicity[]);
                    } else {
                      const filtered = current.filter(id => id !== 'PREFER_NOT_SAY');
                      const updated = e.target.checked
                        ? [...filtered, option.id as Ethnicity]
                        : filtered.filter((id) => id !== option.id);
                      updateOperating('culturalBackground', updated);
                    }
                  }}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: BRAND_COLORS.primary }}
                />
                <span style={{ color: BRAND_COLORS.textPrimary }}>{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Immigration Status */}
      <div className="space-y-3">
        <label className="block text-sm font-medium" style={{ color: BRAND_COLORS.textHeading }}>
          Is your family from another country?
        </label>
        <div className="space-y-2">
          {IMMIGRATION_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
              style={{ borderColor: BRAND_COLORS.borderLight }}
            >
              <input
                type="radio"
                name="immigrationStatus"
                value={option.id}
                checked={operating.immigrationStatus === option.id}
                onChange={(e) => updateOperating('immigrationStatus', e.target.value as ImmigrationStatus)}
                className="w-4 h-4"
                style={{ accentColor: BRAND_COLORS.primary }}
              />
              <span style={{ color: BRAND_COLORS.textPrimary }}>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Religion/Traditions */}
      <div className="space-y-2">
        <label className="block text-sm font-medium" style={{ color: BRAND_COLORS.textHeading }}>
          Any religious or cultural traditions important to you? (Optional)
        </label>
        <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
          This can be part of your unique story if you choose to share it
        </p>
        <input
          type="text"
          value={operating.religion || ''}
          onChange={(e) => updateOperating('religion', e.target.value || null)}
          placeholder="E.g., Muslim, Hindu, Jewish, Christian, Buddhist..."
          className="w-full p-3 border rounded-lg focus:ring-2 focus:outline-none"
          style={{ borderColor: BRAND_COLORS.borderLight }}
        />
      </div>

      {/* Divider */}
      <hr className="my-6" style={{ borderColor: BRAND_COLORS.borderLight }} />

      {/* Parent Occupations */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: BRAND_COLORS.textHeading }}>
            Parent/Guardian 1 occupation <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={operating.parent1Occupation || ''}
            onChange={(e) => updateOperating('parent1Occupation', e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:outline-none"
            style={{ borderColor: BRAND_COLORS.borderLight }}
            required
          >
            <option value="">Select...</option>
            {OCCUPATION_OPTIONS.map((occ) => (
              <option key={occ} value={occ}>
                {occ}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: BRAND_COLORS.textHeading }}>
            Parent/Guardian 2 occupation (if applicable)
          </label>
          <select
            value={operating.parent2Occupation || ''}
            onChange={(e) => updateOperating('parent2Occupation', e.target.value || undefined)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:outline-none"
            style={{ borderColor: BRAND_COLORS.borderLight }}
          >
            <option value="">Select...</option>
            {OCCUPATION_OPTIONS.map((occ) => (
              <option key={occ} value={occ}>
                {occ}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* First Generation */}
      <div className="space-y-3">
        <label className="block text-sm font-medium" style={{ color: BRAND_COLORS.textHeading }}>
          Are you first-generation college? <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
          (Neither parent has a 4-year college degree)
        </p>
        <div className="space-y-2">
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ].map((option) => (
            <label
              key={String(option.value)}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
              style={{ borderColor: BRAND_COLORS.borderLight }}
            >
              <input
                type="radio"
                name="firstGen"
                checked={operating.firstGeneration === option.value}
                onChange={() => updateOperating('firstGeneration', option.value)}
                className="w-4 h-4"
                style={{ accentColor: BRAND_COLORS.primary }}
              />
              <span style={{ color: BRAND_COLORS.textPrimary }}>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Work/Family Responsibilities */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: BRAND_COLORS.textHeading }}>
            Do you work part-time?
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasWork"
                checked={(operating.workHours || 0) > 0}
                onChange={() => updateOperating('workHours', 10)}
                className="w-4 h-4"
                style={{ accentColor: BRAND_COLORS.primary }}
              />
              <span style={{ color: BRAND_COLORS.textPrimary }}>Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasWork"
                checked={operating.workHours === 0 || operating.workHours === undefined}
                onChange={() => updateOperating('workHours', 0)}
                className="w-4 h-4"
                style={{ accentColor: BRAND_COLORS.primary }}
              />
              <span style={{ color: BRAND_COLORS.textPrimary }}>No</span>
            </label>
          </div>
          <AnimatePresence>
            {(operating.workHours || 0) > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2"
              >
                <input
                  type="number"
                  value={operating.workHours || 0}
                  onChange={(e) => updateOperating('workHours', parseInt(e.target.value) || 0)}
                  min="0"
                  max="40"
                  className="w-24 p-2 border rounded-lg"
                  style={{ borderColor: BRAND_COLORS.borderLight }}
                />
                <span className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                  hours per week
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: BRAND_COLORS.textHeading }}>
            Family responsibilities? (siblings, caretaking, etc.)
          </label>
          <input
            type="text"
            value={operating.familyResponsibilities || ''}
            onChange={(e) => updateOperating('familyResponsibilities', e.target.value || null)}
            placeholder="E.g., 'Take care of younger siblings after school'"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:outline-none"
            style={{ borderColor: BRAND_COLORS.borderLight }}
          />
        </div>
      </div>

      {/* Transportation */}
      <div className="space-y-3">
        <label className="block text-sm font-medium" style={{ color: BRAND_COLORS.textHeading }}>
          Transportation access <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div className="space-y-2">
          {[
            { value: 'drive-self', label: 'I can drive myself' },
            { value: 'parent-drives', label: 'Parent can drive me' },
            { value: 'public-transit', label: 'Public transit available' },
            { value: 'limited', label: 'Limited (mostly stay local)' },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
              style={{ borderColor: BRAND_COLORS.borderLight }}
            >
              <input
                type="radio"
                name="transportation"
                value={option.value}
                checked={operating.transportation === option.value}
                onChange={(e) =>
                  updateOperating('transportation', e.target.value as 'drive-self' | 'parent-drives' | 'public-transit' | 'limited')
                }
                className="w-4 h-4"
                style={{ accentColor: BRAND_COLORS.primary }}
              />
              <span style={{ color: BRAND_COLORS.textPrimary }}>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // ============================================================================
  // SECTION 4: TIME (MANDATORY)
  // ============================================================================
  const renderTimeSection = () => {
    const availableHours = operating.availableHoursPerWeek ?? 10;
    const homeworkHours = operating.homeworkHoursPerDay ?? 2;

    // Calculate burnout risk
    const totalCommitted = homeworkHours * 5 + availableHours;
    let burnoutRisk: 'low' | 'moderate' | 'high' = 'low';
    if (totalCommitted > 35) burnoutRisk = 'high';
    else if (totalCommitted > 25) burnoutRisk = 'moderate';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        {/* Why we ask */}
        <div
          className="p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderLeftColor: '#22c55e',
          }}
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#22c55e' }} />
            <div>
              <h3 className="font-semibold mb-1" style={{ color: '#166534' }}>
                Why we ask about time
              </h3>
              <p className="text-sm" style={{ color: '#166534' }}>
                We need to recommend activities that actually fit your schedule.
                There's no point suggesting 20 hours/week of activities if you only have 5!
              </p>
            </div>
          </div>
        </div>

        {/* Homework Hours */}
        <div className="space-y-3">
          <label className="block text-lg font-medium" style={{ color: BRAND_COLORS.textHeading }}>
            On a typical weekday, how much time do you spend on homework?{' '}
            <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="6"
              step="0.5"
              value={homeworkHours}
              onChange={(e) => updateOperating('homeworkHoursPerDay', parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primary} ${(homeworkHours / 6) * 100}%, #e5e7eb ${(homeworkHours / 6) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-sm" style={{ color: BRAND_COLORS.textMuted }}>
              <span>0 hrs</span>
              <span className="font-bold text-lg" style={{ color: BRAND_COLORS.primary }}>
                {homeworkHours} hours
              </span>
              <span>6 hrs</span>
            </div>
          </div>
        </div>

        {/* Available Hours */}
        <div className="space-y-3">
          <label className="block text-lg font-medium" style={{ color: BRAND_COLORS.textHeading }}>
            How much time per week could you commit to college prep activities?{' '}
            <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
            (Extracurriculars, projects, test prep, volunteering)
          </p>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={availableHours}
              onChange={(e) => updateOperating('availableHoursPerWeek', parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #22c55e ${(availableHours / 20) * 100}%, #e5e7eb ${(availableHours / 20) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-sm" style={{ color: BRAND_COLORS.textMuted }}>
              <span>0 hrs</span>
              <span className="font-bold text-lg" style={{ color: '#22c55e' }}>
                {availableHours} hours/week
              </span>
              <span>20 hrs</span>
            </div>
          </div>
        </div>

        {/* Burnout Risk Indicator */}
        <div
          className="p-4 rounded-lg border-2"
          style={{
            backgroundColor:
              burnoutRisk === 'low'
                ? 'rgba(34, 197, 94, 0.1)'
                : burnoutRisk === 'moderate'
                  ? 'rgba(234, 179, 8, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
            borderColor:
              burnoutRisk === 'low'
                ? '#22c55e'
                : burnoutRisk === 'moderate'
                  ? '#eab308'
                  : '#ef4444',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {burnoutRisk === 'low' && '✅'}
              {burnoutRisk === 'moderate' && '⚠️'}
              {burnoutRisk === 'high' && '🔴'}
            </span>
            <div>
              <p className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                {burnoutRisk === 'low' && 'Your schedule looks manageable'}
                {burnoutRisk === 'moderate' && 'Moderate commitment level'}
                {burnoutRisk === 'high' && 'High burnout risk detected'}
              </p>
              <p className="text-sm mt-1" style={{ color: BRAND_COLORS.textPrimary }}>
                {burnoutRisk === 'low' &&
                  'You have good capacity for college prep activities without overloading.'}
                {burnoutRisk === 'moderate' &&
                  "We'll recommend sustainable activities that fit your schedule."}
                {burnoutRisk === 'high' &&
                  "We'll focus on high-impact, time-efficient strategies for you."}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // ============================================================================
  // SECTION NAVIGATION
  // ============================================================================
  const sections = [
    { title: 'Your Interests', component: renderInterestsSection, key: 'interests' },
    { title: 'Your Strengths', component: renderStrengthsSection, key: 'strengths' },
    { title: 'Your Context', component: renderContextSection, key: 'context' },
    { title: 'Your Time', component: renderTimeSection, key: 'time' },
  ];

  const canProceed = useCallback(() => {
    if (currentSection === 0) return true; // Interests all optional
    if (currentSection === 1) return true; // Strengths all optional
    if (currentSection === 2) {
      // Context - check mandatory fields
      return (
        !!operating.parent1Occupation &&
        operating.firstGeneration !== null &&
        operating.firstGeneration !== undefined &&
        !!operating.transportation
      );
    }
    if (currentSection === 3) {
      // Time - check mandatory fields (allow 0 as valid value)
      return (
        operating.availableHoursPerWeek !== undefined &&
        operating.homeworkHoursPerDay !== undefined
      );
    }
    return false;
  }, [currentSection, operating]);

  const handleNext = useCallback(() => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // ========================================================================
      // COMPUTE AND SAVE PSYCHOMETRICS BEFORE PROCEEDING
      // ========================================================================

      // 1. Derive psychometrics from selected strengths
      const strengths = operating.strengths || [];
      const derivedScores = deriveFromStrengths(strengths);

      // 2. Compute time management from operating data
      const timeManagement = computeTimeManagement({
        availableHoursPerWeek: operating.availableHoursPerWeek,
        homeworkHoursPerDay: operating.homeworkHoursPerDay,
      });

      // 3. Derive coachability category from score
      const coachabilityScore = derivedScores.coachability_score || 0.5;
      const coachability: 'LOW' | 'MEDIUM' | 'HIGH' =
        coachabilityScore >= 0.7 ? 'HIGH' :
        coachabilityScore >= 0.4 ? 'MEDIUM' : 'LOW';

      // 4. Save psychometrics to student store
      setPsychometrics({
        openness: derivedScores.openness,
        conscientiousness: derivedScores.conscientiousness,
        extraversion: derivedScores.extraversion,
        agreeableness: derivedScores.agreeableness,
        neuroticism: derivedScores.neuroticism,
        grit_resilience: derivedScores.grit_resilience,
        coachability_score: coachabilityScore,
        coachability,
        introversion_extroversion: (derivedScores.extraversion - 0.5) * 2,
      });

      // 5. Save assessment intelligence (time management + hidden capabilities)
      setAssessmentIntelligence({
        time_management: timeManagement,
        hidden_capabilities: {
          hobby_passions: [],
          unconventional_interests: [],
          hidden_technical_projects: [],
          family_responsibilities: operating.familyResponsibilities || undefined,
          work_experience: operating.workHours && operating.workHours > 0
            ? `Part-time work ${operating.workHours} hrs/week`
            : undefined,
        },
      });

      console.log('[Frame4Context] Saved psychometrics:', {
        derivedScores,
        timeManagement,
        coachability,
      });

      // ========================================================================
      // COMPLETE FRAME AND PROCEED
      // ========================================================================
      calculateCompleteness();
      completeFrame();
      if (onComplete) {
        onComplete();
      } else {
        nextFrame();
      }
    }
  }, [
    currentSection,
    sections.length,
    operating,
    deriveFromStrengths,
    setPsychometrics,
    setAssessmentIntelligence,
    calculateCompleteness,
    completeFrame,
    onComplete,
    nextFrame,
  ]);

  const handleBack = useCallback(() => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSection]);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: BRAND_COLORS.textHeading }}>
          Understanding You
        </h1>
        <p style={{ color: BRAND_COLORS.textPrimary }}>
          These questions help us craft a game plan tailored to YOUR situation, strengths, and goals.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {sections.map((section, index) => (
            <div key={section.key} className="flex items-center flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor:
                    index < currentSection
                      ? '#22c55e'
                      : index === currentSection
                        ? BRAND_COLORS.primary
                        : '#e5e7eb',
                  color: index <= currentSection ? 'white' : BRAND_COLORS.textMuted,
                }}
              >
                {index < currentSection ? '✓' : index + 1}
              </div>
              {index < sections.length - 1 && (
                <div
                  className="flex-1 h-1 mx-2"
                  style={{
                    backgroundColor: index < currentSection ? '#22c55e' : '#e5e7eb',
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-center mt-2" style={{ color: BRAND_COLORS.textMuted }}>
          {sections[currentSection].title}
        </p>
      </div>

      {/* Current Section Content */}
      <div className="mb-8">
        <AnimatePresence mode="wait">
          <div key={currentSection}>{sections[currentSection].component()}</div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: BRAND_COLORS.borderLight }}>
        <button
          onClick={handleBack}
          disabled={currentSection === 0}
          className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          style={{
            backgroundColor: currentSection === 0 ? '#e5e7eb' : '#f3f4f6',
            color: currentSection === 0 ? '#9ca3af' : BRAND_COLORS.textPrimary,
            cursor: currentSection === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          style={{
            backgroundColor: canProceed() ? BRAND_COLORS.primary : '#e5e7eb',
            color: canProceed() ? 'white' : '#9ca3af',
            cursor: canProceed() ? 'pointer' : 'not-allowed',
          }}
        >
          {currentSection < sections.length - 1 ? (
            <>
              Next Section
              <ChevronRight className="w-5 h-5" />
            </>
          ) : (
            <>
              Generate Game Plan
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Frame4Context;
