'use client';

/**
 * Frame 3: Building Your Profile
 *
 * STYLING: Uses BRAND_COLORS constants for consistent Ivylevel branding.
 * Never use dark-mode Tailwind classes (text-text-primary, bg-background-secondary, etc.)
 *
 * LAYOUT: Uses SplitFrameLayout with:
 * - Left: Input cards (spike, leadership, projects, research, etc.)
 * - Right: InsightsPanel for real-time feedback
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useStudentStore, useSessionStore, useAddRealtimeInsight } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { Button } from '@/components/ui/Button';
import { FrameWrapper, CardNavigation } from '@/components/layout/AssessmentLayout';
import { SplitFrameLayout } from '@/components/layout/SplitFrameLayout';
import { InsightsPanel } from '@/components/insights';
import { RealtimeInsightGenerator, type RealtimeInsight } from '@/lib/insights/realtimeInsights';
import { useNotificationStore } from '@/lib/hooks/useInsightNotifications';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { logInput } from '@/lib/utils/dataFlowLogger';
import { Check, Loader2 } from 'lucide-react';
import {
  IconFlame,
  IconCrown,
  IconClock,
  IconRocket,
  IconMicroscope,
  IconMedal,
  IconHeart,
  IconSchool,
  IconBriefcase,
  IconPalette,
  IconTrophy,
  IconGlobe,
  IconMessage,
  IconWand,
  IconAI,
  IconStar,
} from '@/components/icons';
import type { SpikeCategory, LeadershipLevel, ResearchLevel, ServiceLeadership, SaturationLevel } from '@/lib/types/student';
import { HIGH_SCHOOL_SATURATION_DB } from '@/lib/data/nsc-saturation';
import { Card10WhyPassion, Card11WhyService } from './building';

const CARDS = ['spike', 'leadership', 'commitment', 'projects', 'bragText', 'research', 'ecAwards', 'community', 'highSchool', 'passionInterests', 'causesImpact', 'coreValues', 'whyPassion', 'whyService'] as const;
type CardType = (typeof CARDS)[number];

// 🆕 NEW: Options for click-based narrative input cards
const PASSION_INTERESTS = [
  // STEM
  { value: 'AI_ML', label: 'AI & Machine Learning', category: 'STEM' },
  { value: 'BIOTECH', label: 'Biotech & Medicine', category: 'STEM' },
  { value: 'ENGINEERING', label: 'Engineering & Building', category: 'STEM' },
  { value: 'SPACE', label: 'Space & Astronomy', category: 'STEM' },
  { value: 'ENVIRONMENT', label: 'Environment & Climate', category: 'STEM' },
  { value: 'CS_CODING', label: 'Coding & Software', category: 'STEM' },
  // Creative
  { value: 'FILM_MEDIA', label: 'Film & Media', category: 'CREATIVE' },
  { value: 'MUSIC', label: 'Music & Performance', category: 'CREATIVE' },
  { value: 'VISUAL_ART', label: 'Visual Art & Design', category: 'CREATIVE' },
  { value: 'WRITING', label: 'Writing & Storytelling', category: 'CREATIVE' },
  { value: 'FASHION', label: 'Fashion & Style', category: 'CREATIVE' },
  // Humanities & Social
  { value: 'PSYCHOLOGY', label: 'Psychology & Mind', category: 'HUMANITIES' },
  { value: 'POLITICS', label: 'Politics & Policy', category: 'HUMANITIES' },
  { value: 'HISTORY', label: 'History & Culture', category: 'HUMANITIES' },
  { value: 'PHILOSOPHY', label: 'Philosophy & Ethics', category: 'HUMANITIES' },
  { value: 'LANGUAGES', label: 'Languages & Communication', category: 'HUMANITIES' },
  // Business & Impact
  { value: 'ENTREPRENEURSHIP', label: 'Startups & Business', category: 'BUSINESS' },
  { value: 'FINANCE', label: 'Finance & Economics', category: 'BUSINESS' },
  { value: 'SOCIAL_ENTERPRISE', label: 'Social Enterprise', category: 'BUSINESS' },
  // Other
  { value: 'SPORTS_FITNESS', label: 'Sports & Fitness', category: 'OTHER' },
  { value: 'GAMING', label: 'Gaming & Esports', category: 'OTHER' },
  { value: 'FOOD_CULINARY', label: 'Food & Culinary', category: 'OTHER' },
];

const CAUSES = [
  // People
  { value: 'EDUCATION_ACCESS', label: 'Education Access', description: 'Equal learning opportunities' },
  { value: 'MENTAL_HEALTH', label: 'Mental Health', description: 'Wellbeing & awareness' },
  { value: 'HEALTHCARE', label: 'Healthcare Access', description: 'Health for all' },
  { value: 'POVERTY', label: 'Poverty & Hunger', description: 'Basic needs for everyone' },
  { value: 'DISABILITY', label: 'Disability & Accessibility', description: 'Inclusive world' },
  { value: 'ELDERLY', label: 'Elderly Care', description: 'Supporting seniors' },
  // Society
  { value: 'RACIAL_JUSTICE', label: 'Racial Justice', description: 'Equity & fairness' },
  { value: 'GENDER_EQUALITY', label: 'Gender Equality', description: 'Equal opportunities' },
  { value: 'IMMIGRATION', label: 'Immigration & Refugees', description: 'Welcoming communities' },
  { value: 'LGBTQ', label: 'LGBTQ+ Rights', description: 'Love & acceptance' },
  // Environment
  { value: 'CLIMATE', label: 'Climate Action', description: 'Planet protection' },
  { value: 'CONSERVATION', label: 'Wildlife & Conservation', description: 'Protecting nature' },
  { value: 'SUSTAINABILITY', label: 'Sustainability', description: 'Sustainable living' },
  // Tech & Future
  { value: 'DIGITAL_DIVIDE', label: 'Digital Divide', description: 'Tech access for all' },
  { value: 'AI_ETHICS', label: 'AI Ethics', description: 'Responsible technology' },
  { value: 'PRIVACY', label: 'Privacy & Security', description: 'Digital rights' },
  // Community
  { value: 'YOUTH_EMPOWERMENT', label: 'Youth Empowerment', description: 'Young voices matter' },
  { value: 'ARTS_CULTURE', label: 'Arts & Culture', description: 'Creative expression' },
  { value: 'CIVIC_ENGAGEMENT', label: 'Civic Engagement', description: 'Active citizenship' },
];

const CORE_VALUES = [
  // Achievement
  { value: 'EXCELLENCE', label: 'Excellence', description: 'Being the best' },
  { value: 'GROWTH', label: 'Growth', description: 'Always improving' },
  { value: 'INNOVATION', label: 'Innovation', description: 'New ideas' },
  { value: 'CURIOSITY', label: 'Curiosity', description: 'Seeking answers' },
  // Relationships
  { value: 'FAMILY', label: 'Family', description: 'Family first' },
  { value: 'COMMUNITY', label: 'Community', description: 'Together stronger' },
  { value: 'LOYALTY', label: 'Loyalty', description: 'Standing by others' },
  { value: 'EMPATHY', label: 'Empathy', description: 'Understanding others' },
  // Character
  { value: 'INTEGRITY', label: 'Integrity', description: 'Doing what\'s right' },
  { value: 'AUTHENTICITY', label: 'Authenticity', description: 'Being real' },
  { value: 'COURAGE', label: 'Courage', description: 'Facing fears' },
  { value: 'RESILIENCE', label: 'Resilience', description: 'Bouncing back' },
  // Purpose
  { value: 'IMPACT', label: 'Impact', description: 'Making a difference' },
  { value: 'JUSTICE', label: 'Justice', description: 'Fairness for all' },
  { value: 'SERVICE', label: 'Service', description: 'Helping others' },
  { value: 'LEGACY', label: 'Legacy', description: 'Lasting contribution' },
  // Lifestyle
  { value: 'CREATIVITY', label: 'Creativity', description: 'Expressing myself' },
  { value: 'FREEDOM', label: 'Freedom', description: 'Independence' },
  { value: 'BALANCE', label: 'Balance', description: 'Harmony in life' },
  { value: 'ADVENTURE', label: 'Adventure', description: 'Exploring new things' },
];

interface Frame3Props {
  onComplete: () => void;
}

export function Frame3Building({ onComplete }: Frame3Props) {
  const [currentCard, setCurrentCard] = useState(0);
  const { startFrame, completeCard, nextCard, completeFrame } = useSessionStore();

  // Initialize frame on mount (not during render)
  useEffect(() => {
    startFrame(3, CARDS.length);
  }, [startFrame]);

  const handleNext = useCallback(() => {
    completeCard(35);
    if (currentCard < CARDS.length - 1) {
      setCurrentCard((prev) => prev + 1);
      nextCard();
    } else {
      completeFrame();
      onComplete();
    }
  }, [currentCard, completeCard, nextCard, completeFrame, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentCard > 0) {
      setCurrentCard((prev) => prev - 1);
    }
  }, [currentCard]);

  return (
    <FrameWrapper
      title="Building Your Profile"
      subtitle="Tell us about your passions and impact"
    >
      <SplitFrameLayout
        rightPanel={
          <div className="sticky top-24">
            <InsightsPanel
              maxInsights={3}
              categories={['PASSION', 'TEMPORAL', 'CONTEXT', 'HYPER_LOCAL']}
              title="Profile Insights"
            />
          </div>
        }
      >
        <AnimatePresence mode="wait">
          {CARDS[currentCard] === 'spike' && <SpikeCard key="spike" />}
          {CARDS[currentCard] === 'leadership' && <LeadershipCard key="leadership" />}
          {CARDS[currentCard] === 'commitment' && <CommitmentCard key="commitment" />}
          {CARDS[currentCard] === 'projects' && <ProjectsCard key="projects" />}
          {CARDS[currentCard] === 'bragText' && <BragTextCard key="bragText" />}
          {CARDS[currentCard] === 'research' && <ResearchCard key="research" />}
          {CARDS[currentCard] === 'ecAwards' && <ECAwardsCard key="ecAwards" />}
          {CARDS[currentCard] === 'community' && <CommunityCard key="community" />}
          {CARDS[currentCard] === 'highSchool' && <HighSchoolCard key="highSchool" />}
          {CARDS[currentCard] === 'passionInterests' && <PassionInterestsCard key="passionInterests" />}
          {CARDS[currentCard] === 'causesImpact' && <CausesImpactCard key="causesImpact" />}
          {CARDS[currentCard] === 'coreValues' && <CoreValuesCard key="coreValues" />}
          {CARDS[currentCard] === 'whyPassion' && (
            <Card10WhyPassion
              key="whyPassion"
              onNext={handleNext}
              onPrev={handlePrev}
              currentCard={currentCard}
              totalCards={CARDS.length}
            />
          )}
          {CARDS[currentCard] === 'whyService' && (
            <Card11WhyService
              key="whyService"
              onNext={handleNext}
              onPrev={handlePrev}
              currentCard={currentCard}
              totalCards={CARDS.length}
            />
          )}
        </AnimatePresence>

        <CardNavigation
          currentCard={currentCard}
          totalCards={CARDS.length}
          onNext={handleNext}
          onPrev={handlePrev}
          canProgress={true}
        />
      </SplitFrameLayout>
    </FrameWrapper>
  );
}

// 🆕 NEW: Passion Interests Card (Click-based, no typing)
function PassionInterestsCard() {
  const interestAreas = useStudentStore((s) => s.profile.passion.interest_areas ?? []);
  const setInterestAreas = useStudentStore((s) => s.setInterestAreas);

  const toggleInterest = (value: string) => {
    let newAreas: string[];
    if (interestAreas.includes(value)) {
      newAreas = interestAreas.filter((v) => v !== value);
    } else if (interestAreas.length < 4) {
      newAreas = [...interestAreas, value];
    } else {
      return; // Can't add more
    }
    logInput('Frame3', 'PassionInterestsCard', 'passion.interest_areas', newAreas);
    setInterestAreas(newAreas);
  };

  const isValid = interestAreas.length >= 2 && interestAreas.length <= 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card padding="lg">
        <CardContent>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.bgCard }}
            >
              <IconFlame size={20} color={BRAND_COLORS.iconPrimary} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                What topics light you up?
              </h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Pick 2-4 areas you'd explore even without homework
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {PASSION_INTERESTS.map((interest) => {
              const isSelected = interestAreas.includes(interest.value);
              const isDisabled = !isSelected && interestAreas.length >= 4;

              return (
                <button
                  key={interest.value}
                  onClick={() => !isDisabled && toggleInterest(interest.value)}
                  disabled={isDisabled}
                  className="relative p-3 rounded-xl border-2 transition-all text-center"
                  style={isSelected ? {
                    border: `2px solid ${BRAND_COLORS.primary}`,
                    backgroundColor: BRAND_COLORS.primaryBg,
                  } : isDisabled ? {
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                    backgroundColor: BRAND_COLORS.bgSecondary,
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  } : {
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                    backgroundColor: BRAND_COLORS.bgPrimary,
                  }}
                >
                  <p className="font-medium text-sm" style={{ color: isSelected ? BRAND_COLORS.primary : BRAND_COLORS.textHeading }}>
                    {interest.label}
                  </p>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1"
                    >
                      <Check className="w-4 h-4" style={{ color: BRAND_COLORS.primary }} />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
              Selected: {interestAreas.length}/4
            </span>
            {isValid && (
              <div className="flex items-center gap-1" style={{ color: BRAND_COLORS.success }}>
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Great choices!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// 🆕 NEW: Causes & Impact Card (Click-based, no typing)
function CausesImpactCard() {
  const causes = useStudentStore((s) => s.profile.community.causes ?? []);
  const setCauses = useStudentStore((s) => s.setCauses);

  const toggleCause = (value: string) => {
    let newCauses: string[];
    if (causes.includes(value)) {
      newCauses = causes.filter((v) => v !== value);
    } else if (causes.length < 3) {
      newCauses = [...causes, value];
    } else {
      return; // Can't add more
    }
    logInput('Frame3', 'CausesImpactCard', 'community.causes', newCauses);
    setCauses(newCauses);
  };

  const isValid = causes.length >= 1 && causes.length <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card padding="lg">
        <CardContent>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.bgCard }}
            >
              <IconHeart size={20} color={BRAND_COLORS.iconPrimary} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                What change do you want to see?
              </h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Pick 1-3 causes you'd fight for
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CAUSES.map((cause) => {
              const isSelected = causes.includes(cause.value);
              const isDisabled = !isSelected && causes.length >= 3;

              return (
                <button
                  key={cause.value}
                  onClick={() => !isDisabled && toggleCause(cause.value)}
                  disabled={isDisabled}
                  className="relative p-3 rounded-xl border-2 transition-all text-left"
                  style={isSelected ? {
                    border: `2px solid ${BRAND_COLORS.primary}`,
                    backgroundColor: BRAND_COLORS.primaryBg,
                  } : isDisabled ? {
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                    backgroundColor: BRAND_COLORS.bgSecondary,
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  } : {
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                    backgroundColor: BRAND_COLORS.bgPrimary,
                  }}
                >
                  <p className="font-medium text-sm" style={{ color: isSelected ? BRAND_COLORS.primary : BRAND_COLORS.textHeading }}>
                    {cause.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: BRAND_COLORS.textMuted }}>
                    {cause.description}
                  </p>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1"
                    >
                      <Check className="w-4 h-4" style={{ color: BRAND_COLORS.primary }} />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
              Selected: {causes.length}/3
            </span>
            {isValid && (
              <div className="flex items-center gap-1" style={{ color: BRAND_COLORS.success }}>
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Causes selected!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// 🆕 NEW: Core Values Card (Click-based, no typing)
function CoreValuesCard() {
  const coreValues = useStudentStore((s) => s.profile.operating?.core_values ?? []);
  const setCoreValues = useStudentStore((s) => s.setCoreValues);

  const toggleValue = (value: string) => {
    let newValues: string[];
    if (coreValues.includes(value)) {
      newValues = coreValues.filter((v) => v !== value);
    } else if (coreValues.length < 5) {
      newValues = [...coreValues, value];
    } else {
      return; // Can't add more
    }
    logInput('Frame3', 'CoreValuesCard', 'operating.core_values', newValues);
    setCoreValues(newValues);
  };

  const isValid = coreValues.length >= 3 && coreValues.length <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card padding="lg">
        <CardContent>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.bgCard }}
            >
              <IconStar size={20} color={BRAND_COLORS.iconPrimary} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                What do you stand for?
              </h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Pick 3-5 values that define you
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CORE_VALUES.map((val) => {
              const isSelected = coreValues.includes(val.value);
              const isDisabled = !isSelected && coreValues.length >= 5;

              return (
                <button
                  key={val.value}
                  onClick={() => !isDisabled && toggleValue(val.value)}
                  disabled={isDisabled}
                  className="relative p-3 rounded-xl border-2 transition-all text-center"
                  style={isSelected ? {
                    border: `2px solid ${BRAND_COLORS.primary}`,
                    backgroundColor: BRAND_COLORS.primaryBg,
                  } : isDisabled ? {
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                    backgroundColor: BRAND_COLORS.bgSecondary,
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  } : {
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                    backgroundColor: BRAND_COLORS.bgPrimary,
                  }}
                >
                  <p className="font-medium text-sm" style={{ color: isSelected ? BRAND_COLORS.primary : BRAND_COLORS.textHeading }}>
                    {val.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: BRAND_COLORS.textMuted }}>
                    {val.description}
                  </p>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1"
                    >
                      <Check className="w-4 h-4" style={{ color: BRAND_COLORS.primary }} />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
              Selected: {coreValues.length}/5
            </span>
            {isValid && (
              <div className="flex items-center gap-1" style={{ color: BRAND_COLORS.success }}>
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Values defined!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Spike Category Card
function SpikeCard() {
  const spikeCategory = useStudentStore((s) => s.profile.passion.spike_category);
  const setSpikeCategory = useStudentStore((s) => s.setSpikeCategory);

  const spikes: { value: SpikeCategory; label: string; icon: React.FC<{ size?: number; color?: string }>; description: string }[] = [
    { value: 'RESEARCH', label: 'Researcher', icon: IconMicroscope, description: 'Deep scientific inquiry' },
    { value: 'LEADER', label: 'Leader', icon: IconCrown, description: 'Driving change through people' },
    { value: 'SERVICE', label: 'Changemaker', icon: IconHeart, description: 'Community impact focus' },
    { value: 'CREATE', label: 'Creator', icon: IconPalette, description: 'Building & making things' },
    { value: 'BUSINESS', label: 'Entrepreneur', icon: IconBriefcase, description: 'Startups & ventures' },
    { value: 'SPORTS', label: 'Athlete', icon: IconTrophy, description: 'Competitive sports' },
    { value: 'FIGURING', label: 'Explorer', icon: IconGlobe, description: 'Still discovering my path' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card padding="lg">
        <CardContent>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.bgCard }}
            >
              <IconFlame size={20} color={BRAND_COLORS.iconPrimary} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>Your Spike</h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>What defines your passion?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {spikes.map((spike) => {
              const Icon = spike.icon;
              const isSelected = spikeCategory === spike.value;

              return (
                <button
                  key={spike.value}
                  onClick={() => {
                    logInput('Frame3', 'SpikeCard', 'passion.spike_category', spike.value);
                    setSpikeCategory(spike.value);
                  }}
                  className="relative p-4 rounded-xl border-2 transition-all text-center"
                  style={isSelected ? {
                    border: `2px solid ${BRAND_COLORS.primary}`,
                    backgroundColor: BRAND_COLORS.primaryBg,
                  } : {
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                    backgroundColor: BRAND_COLORS.bgPrimary,
                  }}
                >
                  <div className="flex justify-center mb-2">
                    <Icon size={32} color={isSelected ? BRAND_COLORS.primary : BRAND_COLORS.iconPrimary} />
                  </div>
                  <p className="font-medium text-sm" style={{ color: BRAND_COLORS.textHeading }}>{spike.label}</p>
                  <p className="text-xs mt-1" style={{ color: BRAND_COLORS.textMuted }}>{spike.description}</p>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <Check className="w-4 h-4" style={{ color: BRAND_COLORS.primary }} />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Leadership Card
function LeadershipCard() {
  const profile = useStudentStore((s) => s.profile);
  const leadershipLevel = useStudentStore((s) => s.profile.passion.leadership_level);
  const setLeadershipLevel = useStudentStore((s) => s.setLeadershipLevel);
  const addRealtimeInsight = useAddRealtimeInsight();

  const handleLeadershipChange = (value: LeadershipLevel) => {
    logInput('Frame3', 'LeadershipCard', 'passion.leadership_level', value);
    setLeadershipLevel(value);

    // Generate insight for the new leadership level
    const updatedProfile = {
      ...profile,
      passion: { ...profile.passion, leadership_level: value },
    };
    const insight = RealtimeInsightGenerator.generateLeadershipInsight(updatedProfile);
    if (insight) {
      // Add to floating notification queue
      useNotificationStore.getState().addNotification(insight);
      // Also add to panel for history
      addRealtimeInsight(insight);
    }
  };

  const levels: { value: LeadershipLevel; label: string; description: string; score: number }[] = [
    { value: 'FOUNDER_NATIONAL', label: 'National Founder', description: 'Founded org with national reach', score: 100 },
    { value: 'FOUNDER_STATE', label: 'State Founder', description: 'Founded org with state/regional impact', score: 85 },
    { value: 'STATE_PRES', label: 'State President', description: 'Lead a state-level organization', score: 70 },
    { value: 'SCHOOL_PRES', label: 'School President', description: 'Student body or major club president', score: 55 },
    { value: 'OFFICER', label: 'Club Officer', description: 'VP, Secretary, or similar role', score: 40 },
    { value: 'PARTICIPANT', label: 'Active Member', description: 'Engaged participant in activities', score: 25 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card padding="lg">
        <CardContent>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.bgCard }}
            >
              <IconCrown size={20} color={BRAND_COLORS.iconPrimary} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>Leadership Level</h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Your highest leadership role</p>
            </div>
          </div>

          <div className="space-y-2">
            {levels.map((level) => {
              const isSelected = leadershipLevel === level.value;

              return (
                <button
                  key={level.value}
                  onClick={() => handleLeadershipChange(level.value)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left"
                  style={isSelected ? {
                    border: `2px solid ${BRAND_COLORS.primary}`,
                    backgroundColor: BRAND_COLORS.primaryBg,
                  } : {
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                    backgroundColor: BRAND_COLORS.bgPrimary,
                  }}
                >
                  <div>
                    <p className="font-medium" style={{ color: BRAND_COLORS.textHeading }}>{level.label}</p>
                    <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>{level.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: BRAND_COLORS.borderLight }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${level.score}%`, backgroundColor: BRAND_COLORS.primary }}
                      />
                    </div>
                    {isSelected && <Check className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Commitment Card
function CommitmentCard() {
  const ecYears = useStudentStore((s) => s.profile.passion.ec_commitment_years);
  const ecHours = useStudentStore((s) => s.profile.passion.ec_hours_weekly);
  const setECCommitment = useStudentStore((s) => s.setECCommitment);

  const [years, setYears] = useState(ecYears ?? 3);
  const [hours, setHours] = useState(ecHours ?? 10);

  const handleYearsChange = (value: number) => {
    logInput('Frame3', 'CommitmentCard', 'passion.ec_commitment_years', value);
    setYears(value);
    setECCommitment(value, hours);
  };

  const handleHoursChange = (value: number) => {
    logInput('Frame3', 'CommitmentCard', 'passion.ec_hours_weekly', value);
    setHours(value);
    setECCommitment(years, value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card padding="lg">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.bgCard }}
            >
              <IconClock size={20} color={BRAND_COLORS.iconPrimary} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>EC Commitment</h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Depth over breadth matters</p>
            </div>
          </div>

          <Slider
            label="Years of Commitment"
            min={1}
            max={6}
            step={0.5}
            value={years}
            onChange={(e) => handleYearsChange(parseFloat(e.target.value))}
            formatValue={(v) => `${v} years`}
            hint="To your primary activity"
          />

          <Slider
            label="Hours per Week"
            min={1}
            max={30}
            step={1}
            value={hours}
            onChange={(e) => handleHoursChange(parseInt(e.target.value))}
            formatValue={(v) => `${v} hrs/week`}
            hint="Average weekly commitment"
          />

          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: BRAND_COLORS.bgSuccess,
              border: `1px solid rgba(22, 163, 74, 0.2)`,
            }}
          >
            <p className="text-sm" style={{ color: BRAND_COLORS.textPrimary }}>
              <strong style={{ color: BRAND_COLORS.success }}>{years * hours * 40}</strong> estimated total hours invested!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Projects Card
function ProjectsCard() {
  const projectImpact = useStudentStore((s) => s.profile.passion.project_impact);
  const projectDescription = useStudentStore((s) => s.profile.passion.project_description);
  const setProjectImpact = useStudentStore((s) => s.setProjectImpact);

  const [impact, setImpact] = useState(projectImpact ?? 100);
  const [description, setDescription] = useState(projectDescription ?? '');

  const handleImpactChange = (value: number) => {
    setImpact(value);
    setProjectImpact(value, description);
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    setProjectImpact(impact, text);
  };

  const getImpactLevel = (impact: number) => {
    if (impact >= 10000) return { text: 'Massive impact!', color: BRAND_COLORS.success };
    if (impact >= 1000) return { text: 'Significant reach', color: BRAND_COLORS.primary };
    if (impact >= 100) return { text: 'Solid impact', color: BRAND_COLORS.warning };
    return { text: 'Growing impact', color: BRAND_COLORS.textSecondary };
  };

  const impactLevel = getImpactLevel(impact);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card padding="lg">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.bgCard }}
            >
              <IconRocket size={20} color={BRAND_COLORS.iconPrimary} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>Projects & Impact</h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>What have you built or created?</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: BRAND_COLORS.textSecondary }}>
              Describe your most impactful project
            </label>
            <textarea
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="e.g., Built an app that helps 500 students track homework..."
              className="w-full px-4 py-3 rounded-xl resize-none h-24 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: BRAND_COLORS.bgPrimary,
                border: `1px solid ${BRAND_COLORS.borderLight}`,
                color: BRAND_COLORS.textPrimary,
              }}
            />
          </div>

          <div>
            <Slider
              label="People Impacted"
              min={0}
              max={10000}
              step={10}
              value={impact}
              onChange={(e) => handleImpactChange(parseInt(e.target.value))}
              formatValue={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString()}
              hint="Estimate the reach of your work"
            />
            <p className="text-sm mt-1" style={{ color: impactLevel.color }}>{impactLevel.text}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Brag Text Card with AI NLP Extraction
function BragTextCard() {
  const bragText = useStudentStore((s) => s.profile.passion.brag_text);
  const setBragText = useStudentStore((s) => s.setBragText);
  const setSpikeCategory = useStudentStore((s) => s.setSpikeCategory);
  const setLeadershipLevel = useStudentStore((s) => s.setLeadershipLevel);
  const setResearchLevel = useStudentStore((s) => s.setResearchLevel);
  const setProjectImpact = useStudentStore((s) => s.setProjectImpact);

  const [text, setText] = useState(bragText ?? '');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extraction, setExtraction] = useState<{
    detected_spike: string | null;
    spike_confidence: number;
    estimated_impact_people: number;
    leadership_indicators: string[];
    passion_keywords: string[];
    overall_confidence: number;
    estimated_leadership_level?: string;
    estimated_research_level?: string;
  } | null>(null);

  const handleTextChange = (value: string) => {
    setText(value);
    setBragText(value);
    setExtraction(null);
  };

  const runNLPExtraction = async () => {
    if (text.length < 50) return;

    setIsExtracting(true);
    try {
      const response = await fetch('/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'brag_text', text }),
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.extraction;
        setExtraction(result);

        // Auto-update profile based on extraction if confidence is high
        if (result.overall_confidence > 0.7) {
          if (result.detected_spike && result.spike_confidence > 0.6) {
            const spikeMap: Record<string, SpikeCategory> = {
              'LEADER': 'LEADER',
              'STEM_BUILDER': 'CREATE',
              'HUMANITIES': 'CREATE',
              'ARTIST': 'CREATE',
              'ATHLETE': 'SPORTS',
              'ENTREPRENEUR': 'BUSINESS',
              'ACTIVIST': 'SERVICE',
            };
            const mappedSpike = spikeMap[result.detected_spike];
            if (mappedSpike) setSpikeCategory(mappedSpike);
          }

          if (result.estimated_leadership_level) {
            const leadershipMap: Record<string, LeadershipLevel> = {
              'NATIONAL_PRES': 'FOUNDER_NATIONAL',
              'STATE_PRES': 'STATE_PRES',
              'SCHOOL_PRES': 'SCHOOL_PRES',
              'CLUB_PRES': 'OFFICER',
              'MEMBER': 'PARTICIPANT',
            };
            const mappedLeadership = leadershipMap[result.estimated_leadership_level];
            if (mappedLeadership) setLeadershipLevel(mappedLeadership);
          }

          if (result.estimated_research_level) {
            const researchMap: Record<string, ResearchLevel> = {
              'PUBLISHED': 'NATIONAL',
              'MENTORED': 'STATE',
              'SCHOOL': 'SCHOOL',
              'NONE': 'NONE',
            };
            const mappedResearch = researchMap[result.estimated_research_level];
            if (mappedResearch) setResearchLevel(mappedResearch);
          }

          if (result.estimated_impact_people > 0) {
            setProjectImpact(result.estimated_impact_people, text);
          }
        }
      }
    } catch (error) {
      console.error('NLP extraction error:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card padding="lg">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.bgCard }}
            >
              <IconMessage size={20} color={BRAND_COLORS.iconPrimary} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>Tell Us Your Story</h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>What makes you special? Brag a little!</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: BRAND_COLORS.textSecondary }}>
              Describe your accomplishments, passions, and what you're proud of
            </label>
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="e.g., I led my school's robotics team to state finals, founded a coding club that taught 200+ elementary students, and published research on machine learning with a Stanford professor..."
              className="w-full px-4 py-3 rounded-xl resize-none h-32 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: BRAND_COLORS.bgPrimary,
                border: `1px solid ${BRAND_COLORS.borderLight}`,
                color: BRAND_COLORS.textPrimary,
              }}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                {text.length} characters {text.length < 50 && '(minimum 50)'}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={runNLPExtraction}
                disabled={text.length < 50 || isExtracting}
                leftIcon={isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <IconWand size={16} color={BRAND_COLORS.iconPrimary} />}
              >
                {isExtracting ? 'Analyzing...' : 'AI Extract'}
              </Button>
            </div>
          </div>

          {extraction && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl"
              style={{
                backgroundColor: BRAND_COLORS.bgSuccess,
                border: `1px solid rgba(22, 163, 74, 0.2)`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <IconAI size={16} color={BRAND_COLORS.success} />
                <span className="font-semibold text-sm" style={{ color: BRAND_COLORS.success }}>
                  AI Extraction ({(extraction.overall_confidence * 100).toFixed(0)}% confidence)
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {extraction.detected_spike && (
                  <p style={{ color: BRAND_COLORS.textPrimary }}>
                    <span style={{ color: BRAND_COLORS.textMuted }}>Detected Spike:</span>{' '}
                    <span className="font-medium" style={{ color: BRAND_COLORS.primary }}>{extraction.detected_spike}</span>
                    {' '}({(extraction.spike_confidence * 100).toFixed(0)}% confidence)
                  </p>
                )}

                {extraction.leadership_indicators.length > 0 && (
                  <p style={{ color: BRAND_COLORS.textPrimary }}>
                    <span style={{ color: BRAND_COLORS.textMuted }}>Leadership:</span>{' '}
                    {extraction.leadership_indicators.slice(0, 2).join(', ')}
                  </p>
                )}

                {extraction.estimated_impact_people > 0 && (
                  <p style={{ color: BRAND_COLORS.textPrimary }}>
                    <span style={{ color: BRAND_COLORS.textMuted }}>Impact:</span>{' '}
                    ~{extraction.estimated_impact_people.toLocaleString()} people
                  </p>
                )}

                {extraction.passion_keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {extraction.passion_keywords.slice(0, 5).map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: BRAND_COLORS.primaryBg,
                          color: BRAND_COLORS.primary,
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
            Our AI analyzes your story to auto-fill profile fields. You can always adjust manually.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Research Card
function ResearchCard() {
  const profile = useStudentStore((s) => s.profile);
  const researchLevel = useStudentStore((s) => s.profile.passion.research_level);
  const setResearchLevel = useStudentStore((s) => s.setResearchLevel);
  const addRealtimeInsight = useAddRealtimeInsight();

  const handleResearchChange = (value: ResearchLevel) => {
    setResearchLevel(value);

    // Generate insight for the new research level
    const updatedProfile = {
      ...profile,
      passion: { ...profile.passion, research_level: value },
    };
    const insight = RealtimeInsightGenerator.generateResearchInsight(updatedProfile);
    if (insight) {
      // Add to floating notification queue
      useNotificationStore.getState().addNotification(insight);
      // Also add to panel for history
      addRealtimeInsight(insight);
    }
  };

  const levels: { value: ResearchLevel; label: string; description: string }[] = [
    { value: 'NATIONAL', label: 'National Publication', description: 'Published in peer-reviewed journal or major conference' },
    { value: 'STATE', label: 'Regional Recognition', description: 'State science fair, regional competitions' },
    { value: 'SCHOOL', label: 'School Research', description: 'Research class, science fair, or mentored project' },
    { value: 'INDEPENDENT', label: 'Self-Directed', description: 'Independent exploration or online courses' },
    { value: 'NONE', label: 'Not Yet', description: 'Haven\'t done formal research yet' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card padding="lg">
        <CardContent>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.bgCard }}
            >
              <IconMicroscope size={20} color={BRAND_COLORS.iconPrimary} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>Research Experience</h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Academic or scientific research</p>
            </div>
          </div>

          <div className="space-y-2">
            {levels.map((level) => {
              const isSelected = researchLevel === level.value;

              return (
                <button
                  key={level.value}
                  onClick={() => handleResearchChange(level.value)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left"
                  style={isSelected ? {
                    border: `2px solid ${BRAND_COLORS.primary}`,
                    backgroundColor: BRAND_COLORS.primaryBg,
                  } : {
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                    backgroundColor: BRAND_COLORS.bgPrimary,
                  }}
                >
                  <div>
                    <p className="font-medium" style={{ color: BRAND_COLORS.textHeading }}>{level.label}</p>
                    <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>{level.description}</p>
                  </div>
                  {isSelected && <Check className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// EC Awards Card
function ECAwardsCard() {
  const ecAwards = useStudentStore((s) => s.profile.passion.ec_awards);
  const setECAwards = useStudentStore((s) => s.setECAwards);

  const awardLevels = [
    { id: 'INTERNATIONAL', label: 'International', description: 'Global competition winner' },
    { id: 'NATIONAL', label: 'National', description: 'National-level recognition' },
    { id: 'STATE', label: 'State', description: 'State-wide achievement' },
    { id: 'REGIONAL', label: 'Regional', description: 'Multi-school or district' },
    { id: 'LOCAL', label: 'Local', description: 'School-level awards' },
  ];

  const toggleAward = (awardId: string) => {
    if (ecAwards.includes(awardId)) {
      setECAwards(ecAwards.filter((a) => a !== awardId));
    } else {
      setECAwards([...ecAwards, awardId]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card padding="lg">
        <CardContent>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.bgCard }}
            >
              <IconMedal size={20} color={BRAND_COLORS.iconPrimary} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>EC Awards & Recognition</h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Select all levels achieved</p>
            </div>
          </div>

          <div className="space-y-2">
            {awardLevels.map((award) => {
              const isSelected = ecAwards.includes(award.id);

              return (
                <button
                  key={award.id}
                  onClick={() => toggleAward(award.id)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left"
                  style={isSelected ? {
                    border: `2px solid ${BRAND_COLORS.warning}`,
                    backgroundColor: BRAND_COLORS.bgWarning,
                  } : {
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                    backgroundColor: BRAND_COLORS.bgPrimary,
                  }}
                >
                  <div>
                    <p className="font-medium" style={{ color: BRAND_COLORS.textHeading }}>{award.label}</p>
                    <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>{award.description}</p>
                  </div>
                  {isSelected ? (
                    <Check className="w-5 h-5" style={{ color: BRAND_COLORS.warning }} />
                  ) : (
                    <div
                      className="w-5 h-5 rounded border"
                      style={{ borderColor: BRAND_COLORS.borderDefault }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Community Service Card
function CommunityCard() {
  const profile = useStudentStore((s) => s.profile);
  const serviceLeadership = useStudentStore((s) => s.profile.community.service_leadership);
  const serviceHours = useStudentStore((s) => s.profile.community.service_hours);
  const communityImpact = useStudentStore((s) => s.profile.community.community_impact);
  const setServiceLeadership = useStudentStore((s) => s.setServiceLeadership);
  const setServiceHours = useStudentStore((s) => s.setServiceHours);
  const setCommunityImpact = useStudentStore((s) => s.setCommunityImpact);
  const addRealtimeInsight = useAddRealtimeInsight();

  const [hours, setHours] = useState(serviceHours ?? 100);
  const [impact, setImpact] = useState(communityImpact ?? 200);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const generateServiceInsight = useCallback((hoursValue: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const updatedProfile = {
        ...profile,
        community: { ...profile.community, service_hours: hoursValue },
      };
      const insight = RealtimeInsightGenerator.generateServiceInsight(updatedProfile);
      if (insight) {
        // Add to floating notification queue
        useNotificationStore.getState().addNotification(insight);
        // Also add to panel for history
        addRealtimeInsight(insight);
      }
    }, 500);
  }, [profile, addRealtimeInsight]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const levels: { value: ServiceLeadership; label: string }[] = [
    { value: 'NATIONAL', label: 'National Organization Leader' },
    { value: 'REGIONAL', label: 'Regional/Multi-School' },
    { value: 'LOCAL', label: 'Local Community Leader' },
    { value: 'PARTICIPANT', label: 'Active Volunteer' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card padding="lg">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.bgCard }}
            >
              <IconHeart size={20} color={BRAND_COLORS.iconPrimary} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>Community Service</h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Your service and impact</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: BRAND_COLORS.textSecondary }}>
              Service Leadership Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {levels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setServiceLeadership(level.value)}
                  className="p-3 rounded-xl border-2 text-sm font-medium transition-all"
                  style={serviceLeadership === level.value ? {
                    border: `2px solid ${BRAND_COLORS.primary}`,
                    backgroundColor: BRAND_COLORS.primaryBg,
                    color: BRAND_COLORS.textHeading,
                  } : {
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                    backgroundColor: BRAND_COLORS.bgPrimary,
                    color: BRAND_COLORS.textSecondary,
                  }}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <Slider
            label="Service Hours"
            min={0}
            max={500}
            step={10}
            value={hours}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setHours(val);
              setServiceHours(val);
              generateServiceInsight(val);
            }}
            formatValue={(v) => `${v} hours`}
          />

          <Slider
            label="People Helped"
            min={0}
            max={5000}
            step={10}
            value={impact}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setImpact(val);
              setCommunityImpact(val);
            }}
            formatValue={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString()}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// High School Card
function HighSchoolCard() {
  const highSchool = useStudentStore((s) => s.profile.high_school);
  const setHighSchool = useStudentStore((s) => s.setHighSchool);

  const [searchQuery, setSearchQuery] = useState(highSchool?.hs_name || '');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const matchingSchools = Object.values(HIGH_SCHOOL_SATURATION_DB)
    .filter((school) =>
      school.hs_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  // 🆕 FIX: Save typed school name even if not in database (after debounce)
  // This ensures the school name is saved even if user doesn't click dropdown
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.length >= 3) {
      debounceRef.current = setTimeout(() => {
        // Only save if different from current value
        if (searchQuery !== highSchool?.hs_name) {
          console.log('[HighSchoolCard] Auto-saving typed school name:', searchQuery);
          const hsData = {
            hs_name: searchQuery,
            hs_code: '',
            hs_type: 'PUBLIC' as const,
            region: 'BAY_AREA' as const,  // Default
            saturation_level: 'MEDIUM' as const,  // Default
            ivy_applicants_per_year: 0,
            saturation_adjustment: 0,
          };
          logInput('Frame3', 'HighSchoolCard', 'high_school.hs_name (typed)', searchQuery);
          setHighSchool(hsData);
        }
      }, 1500); // 1.5s debounce for typed input
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, highSchool?.hs_name, setHighSchool]);

  const selectSchool = (school: typeof HIGH_SCHOOL_SATURATION_DB[string]) => {
    // Clear debounce when selecting from dropdown
    if (debounceRef.current) clearTimeout(debounceRef.current);

    setSearchQuery(school.hs_name);
    const hsData = {
      hs_name: school.hs_name,
      hs_code: school.hs_code,
      hs_type: school.hs_type,
      region: school.region,
      saturation_level: school.saturation_level,
      ivy_applicants_per_year: school.ivy_applicants_per_year,
      saturation_adjustment: school.saturation_adjustment,
    };
    logInput('Frame3', 'HighSchoolCard', 'high_school (selected)', hsData);
    setHighSchool(hsData);
  };

  const getSaturationColor = (level: SaturationLevel) => {
    switch (level) {
      case 'ULTRA': return BRAND_COLORS.error;
      case 'HIGH': return BRAND_COLORS.warning;
      case 'MEDIUM': return BRAND_COLORS.primary;
      case 'LOW': return BRAND_COLORS.success;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card padding="lg">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.bgCard }}
            >
              <IconSchool size={20} color={BRAND_COLORS.iconPrimary} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>Your High School</h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Helps us understand context</p>
            </div>
          </div>

          <div className="relative">
            <Input
              label="Search your school"
              placeholder="e.g., Monta Vista High School"
              value={searchQuery}
              onChange={(e) => {
                const query = e.target.value;
                setSearchQuery(query);
                // Log search activity (not saved to store until school is selected)
                if (query.length >= 2) {
                  const matches = Object.values(HIGH_SCHOOL_SATURATION_DB)
                    .filter((school) => school.hs_name.toLowerCase().includes(query.toLowerCase()));
                  console.log(`[HighSchoolCard] Search: "${query}" → ${matches.length} matches found`);
                  if (matches.length === 0) {
                    console.warn('[HighSchoolCard] ⚠️ No matching schools! User may need to select manually or school not in database.');
                  }
                }
              }}
              leftElement={<IconSchool size={20} color={BRAND_COLORS.iconMuted} />}
            />

            {searchQuery.length >= 2 && matchingSchools.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-10 overflow-hidden"
                style={{
                  backgroundColor: BRAND_COLORS.bgPrimary,
                  border: `1px solid ${BRAND_COLORS.borderLight}`,
                }}
              >
                {matchingSchools.map((school) => (
                  <button
                    key={school.hs_code}
                    onClick={() => selectSchool(school)}
                    className="w-full p-3 text-left transition-colors"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS.bgHover}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <p className="font-medium" style={{ color: BRAND_COLORS.textHeading }}>{school.hs_name}</p>
                    <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                      {school.region.replace('_', ' ')} • {school.hs_type}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {highSchool?.hs_name && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl"
              style={{
                backgroundColor: BRAND_COLORS.bgPrimary,
                border: `1px solid ${BRAND_COLORS.borderLight}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Ivy Saturation</span>
                <span className="font-semibold" style={{ color: getSaturationColor(highSchool.saturation_level) }}>
                  {highSchool.saturation_level}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Ivy Applicants/Year</span>
                <span className="font-medium" style={{ color: BRAND_COLORS.textHeading }}>~{highSchool.ivy_applicants_per_year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Score Adjustment</span>
                <span
                  className="font-semibold"
                  style={{ color: highSchool.saturation_adjustment < 0 ? BRAND_COLORS.error : BRAND_COLORS.success }}
                >
                  {highSchool.saturation_adjustment > 0 ? '+' : ''}{(highSchool.saturation_adjustment * 100).toFixed(0)}%
                </span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default Frame3Building;
