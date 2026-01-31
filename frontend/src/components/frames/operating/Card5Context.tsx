'use client';

/**
 * Card 5: Context (Frame 4)
 * Collects: Work hours, Family responsibilities, Transportation, Parent occupations, School resources
 * All fields are OPTIONAL except transportation (for planning purposes)
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudentStore } from '@/lib/store';
import { CardNavigation } from '@/components/layout/AssessmentLayout';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { Briefcase, Home, Car, GraduationCap, BookOpen } from 'lucide-react';
import type { TransportationType } from '@/lib/types/student';

interface Card5ContextProps {
  onNext: () => void;
  onPrev: () => void;
  currentCard: number;
  totalCards: number;
}

const TRANSPORTATION_OPTIONS: { value: TransportationType; label: string; description: string }[] = [
  { value: 'drive-self', label: 'I drive myself', description: 'Full flexibility' },
  { value: 'parent-drives', label: 'Parent drives', description: 'Dependent on parent schedule' },
  { value: 'public-transit', label: 'Public transit', description: 'Bus, train, etc.' },
  { value: 'limited', label: 'Limited access', description: 'Walk, bike, or limited options' },
];

const RESOURCES_OPTIONS: { value: 'limited' | 'adequate' | 'excellent'; label: string; description: string }[] = [
  { value: 'limited', label: 'Limited', description: 'Few AP courses, minimal extracurriculars' },
  { value: 'adequate', label: 'Adequate', description: 'Some AP courses, decent opportunities' },
  { value: 'excellent', label: 'Excellent', description: 'Many APs, extensive programs' },
];

const GUIDANCE_OPTIONS: { value: 'none' | 'some' | 'extensive'; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'Figuring it out on my own' },
  { value: 'some', label: 'Some', description: 'Basic school counselor support' },
  { value: 'extensive', label: 'Extensive', description: 'Counselor + private consultant' },
];

export function Card5Context({
  onNext,
  onPrev,
  currentCard,
  totalCards,
}: Card5ContextProps) {
  const profile = useStudentStore((s) => s.profile);
  const updateOperating = useStudentStore((s) => s.updateOperating);

  const [workHours, setWorkHours] = useState<number>(
    profile.operating?.workHours ?? 0
  );
  const [familyResponsibilities, setFamilyResponsibilities] = useState<string>(
    profile.operating?.familyResponsibilities || ''
  );
  const [transportation, setTransportation] = useState<TransportationType | null>(
    profile.operating?.transportation || null
  );
  const [parent1Occupation, setParent1Occupation] = useState<string>(
    profile.operating?.parent1Occupation || ''
  );
  const [parent2Occupation, setParent2Occupation] = useState<string>(
    profile.operating?.parent2Occupation || ''
  );
  const [schoolResources, setSchoolResources] = useState<'limited' | 'adequate' | 'excellent' | null>(
    profile.operating?.schoolResources || null
  );
  const [collegeGuidance, setCollegeGuidance] = useState<'none' | 'some' | 'extensive' | null>(
    profile.operating?.collegeGuidanceAccess || null
  );

  // Auto-save to store on change
  useEffect(() => {
    updateOperating('workHours', workHours);
  }, [workHours, updateOperating]);

  useEffect(() => {
    if (familyResponsibilities) {
      updateOperating('familyResponsibilities', familyResponsibilities);
    }
  }, [familyResponsibilities, updateOperating]);

  useEffect(() => {
    if (transportation) updateOperating('transportation', transportation);
  }, [transportation, updateOperating]);

  useEffect(() => {
    if (parent1Occupation) {
      updateOperating('parent1Occupation', parent1Occupation);
    }
  }, [parent1Occupation, updateOperating]);

  useEffect(() => {
    if (parent2Occupation) {
      updateOperating('parent2Occupation', parent2Occupation);
    }
  }, [parent2Occupation, updateOperating]);

  useEffect(() => {
    if (schoolResources) {
      updateOperating('schoolResources', schoolResources);
    }
  }, [schoolResources, updateOperating]);

  useEffect(() => {
    if (collegeGuidance) {
      updateOperating('collegeGuidanceAccess', collegeGuidance);
    }
  }, [collegeGuidance, updateOperating]);

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
          Your Context
        </h2>
        <p className="text-base" style={{ color: BRAND_COLORS.textSecondary }}>
          Understanding your circumstances helps us recommend what's realistic
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
        {/* Question 1: Work Hours */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              Do you work during the school year? (optional)
            </label>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={workHours}
              onChange={(e) => setWorkHours(Number(e.target.value))}
              className="flex-1"
              style={{ accentColor: BRAND_COLORS.primary }}
            />
            <span
              className="text-sm font-bold min-w-[80px]"
              style={{ color: BRAND_COLORS.primary }}
            >
              {workHours} hrs/week
            </span>
          </div>
          {workHours >= 20 && (
            <p className="text-xs mt-2" style={{ color: BRAND_COLORS.textMuted }}>
              Working 20+ hours is significant - we'll factor this into recommendations
            </p>
          )}
        </div>

        {/* Question 2: Family Responsibilities */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Home className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              Family responsibilities (optional)
            </label>
          </div>
          <textarea
            value={familyResponsibilities}
            onChange={(e) => setFamilyResponsibilities(e.target.value)}
            placeholder="e.g., Care for younger siblings, translate for parents, family business..."
            rows={2}
            className="w-full p-3 rounded-xl text-sm resize-none"
            style={{
              border: `1px solid ${BRAND_COLORS.borderLight}`,
              color: BRAND_COLORS.textPrimary,
            }}
          />
        </div>

        {/* Question 3: Transportation */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Car className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              Transportation (optional)
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TRANSPORTATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTransportation(option.value)}
                className="p-3 rounded-lg text-left transition-all"
                style={{
                  backgroundColor:
                    transportation === option.value
                      ? BRAND_COLORS.primaryBg
                      : 'white',
                  border: `2px solid ${
                    transportation === option.value
                      ? BRAND_COLORS.primary
                      : BRAND_COLORS.borderLight
                  }`,
                }}
              >
                <div
                  className="text-sm font-medium"
                  style={{
                    color:
                      transportation === option.value
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
        </div>

        {/* Question 4: Parent Occupations */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              Parent/Guardian occupations (optional)
            </label>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={parent1Occupation}
              onChange={(e) => setParent1Occupation(e.target.value)}
              placeholder="Parent 1 occupation (e.g., Teacher, Engineer, etc.)"
              className="w-full p-3 rounded-xl text-sm"
              style={{
                border: `1px solid ${BRAND_COLORS.borderLight}`,
                color: BRAND_COLORS.textPrimary,
              }}
            />
            <input
              type="text"
              value={parent2Occupation}
              onChange={(e) => setParent2Occupation(e.target.value)}
              placeholder="Parent 2 occupation (optional)"
              className="w-full p-3 rounded-xl text-sm"
              style={{
                border: `1px solid ${BRAND_COLORS.borderLight}`,
                color: BRAND_COLORS.textPrimary,
              }}
            />
          </div>
        </div>

        {/* Question 5: School Resources */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            <label
              className="text-sm font-medium"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              School resources (optional)
            </label>
          </div>
          <div className="space-y-2">
            {RESOURCES_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSchoolResources(option.value)}
                className="w-full p-3 rounded-lg text-left transition-all"
                style={{
                  backgroundColor:
                    schoolResources === option.value
                      ? BRAND_COLORS.primaryBg
                      : 'white',
                  border: `1px solid ${
                    schoolResources === option.value
                      ? BRAND_COLORS.primary
                      : BRAND_COLORS.borderLight
                  }`,
                }}
              >
                <div
                  className="text-sm font-medium"
                  style={{
                    color:
                      schoolResources === option.value
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
        </div>

        {/* Question 6: College Guidance */}
        <div>
          <label
            className="text-sm font-medium mb-3 block"
            style={{ color: BRAND_COLORS.textHeading }}
          >
            College application guidance (optional)
          </label>
          <div className="space-y-2">
            {GUIDANCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setCollegeGuidance(option.value)}
                className="w-full p-3 rounded-lg text-left transition-all"
                style={{
                  backgroundColor:
                    collegeGuidance === option.value
                      ? BRAND_COLORS.primaryBg
                      : 'white',
                  border: `1px solid ${
                    collegeGuidance === option.value
                      ? BRAND_COLORS.primary
                      : BRAND_COLORS.borderLight
                  }`,
                }}
              >
                <div
                  className="text-sm font-medium"
                  style={{
                    color:
                      collegeGuidance === option.value
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
