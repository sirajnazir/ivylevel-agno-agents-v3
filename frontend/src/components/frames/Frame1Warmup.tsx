'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useStudentStore, useSessionStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FrameWrapper, CardNavigation } from '@/components/layout/AssessmentLayout';
import { SplitFrameLayout } from '@/components/layout/SplitFrameLayout';
import { SCHOOL_DATABASE } from '@/lib/data/schools';
import { FRAME1_MESSAGES } from '@/lib/constants/droneMessages';
import { logInput } from '@/lib/utils/dataFlowLogger';
import {
  User,
  Users,
  GraduationCap,
  Target,
  Rocket,
  Check,
  Sparkles,
} from 'lucide-react';
import { CollegeLogo } from '@/components/ui/CollegeLogo';
import type { Grade, Role, MajorCertainty } from '@/lib/types/student';

// Card components for each step
const CARDS = ['role', 'identity', 'schools', 'major'] as const;
type CardType = (typeof CARDS)[number];

interface Frame1Props {
  onComplete: () => void;
}

export function Frame1Warmup({ onComplete }: Frame1Props) {
  const [currentCard, setCurrentCard] = useState(0);
  const { startFrame, completeCard, nextCard, completeFrame } = useSessionStore();

  // Initialize frame on mount (not during render)
  useEffect(() => {
    startFrame(1, CARDS.length);
  }, [startFrame]);

  const handleNext = useCallback(() => {
    completeCard(25); // 25 Edge per card
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

  // Get the drone message for the current card
  const currentCardType = CARDS[currentCard];
  const droneMessage = FRAME1_MESSAGES[currentCardType] || FRAME1_MESSAGES.role;

  return (
    <FrameWrapper
      title="Welcome to IvyQuest"
      highlights={["IvyQuest"]}
      subtitle="Let's build your Digital Twin Fleet"
    >
      <SplitFrameLayout droneMessage={droneMessage}>
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {CARDS[currentCard] === 'role' && (
              <RoleCard key="role" onComplete={handleNext} />
            )}
            {CARDS[currentCard] === 'identity' && (
              <IdentityCard key="identity" />
            )}
            {CARDS[currentCard] === 'schools' && (
              <SchoolsCard key="schools" />
            )}
            {CARDS[currentCard] === 'major' && (
              <MajorCard key="major" />
            )}
          </AnimatePresence>

          <CardNavigation
            currentCard={currentCard}
            totalCards={CARDS.length}
            onNext={handleNext}
            onPrev={handlePrev}
            canProgress={useCardValidation(CARDS[currentCard])}
          />
        </div>
      </SplitFrameLayout>
    </FrameWrapper>
  );
}

// Validation hook
function useCardValidation(card: CardType): boolean {
  const profile = useStudentStore((s) => s.profile);

  switch (card) {
    case 'role':
      return true; // Role has default
    case 'identity':
      return profile.identity.name.trim().length >= 2;
    case 'schools':
      return profile.target_schools.length >= 1;
    case 'major':
      return profile.intended_major.trim().length >= 2;
    default:
      return true;
  }
}

// Role selection card with Ivylevel styling
// v10.0: Also sets userType in session store for DualView
function RoleCard({ onComplete }: { onComplete: () => void }) {
  const role = useStudentStore((s) => s.profile.identity.role);
  const setRole = useStudentStore((s) => s.setRole);
  const setUserType = useSessionStore((s) => s.setUserType);

  const roles: { value: Role; label: string; icon: typeof User; description: string }[] = [
    {
      value: 'STUDENT',
      label: 'Student',
      icon: User,
      description: "I'm preparing for college applications",
    },
    {
      value: 'PARENT',
      label: 'Parent',
      icon: Users,
      description: "I'm helping my child prepare",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = role === r.value;

          return (
            <Card
              key={r.value}
              hoverable
              selected={isSelected}
              onClick={() => {
                logInput('Frame1', 'RoleCard', 'identity.role', r.value);
                setRole(r.value);
                setUserType(r.value === 'PARENT' ? 'parent' : 'student');
              }}
              className="cursor-pointer"
              padding="lg"
            >
              <CardContent className="text-center">
                <div
                  className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
                  style={{
                    backgroundColor: isSelected ? '#FF4A23' : 'rgba(255, 74, 35, 0.1)',
                    color: isSelected ? 'white' : '#FF4A23',
                    boxShadow: isSelected ? '0 8px 24px rgba(254, 74, 34, 0.3)' : 'none',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#641432' }}>
                  {r.label}
                </h3>
                <p className="text-base" style={{ color: '#6b7280' }}>
                  {r.description}
                </p>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255, 74, 35, 0.1)' }}
                    >
                      <Check className="w-5 h-5" style={{ color: '#FF4A23' }} />
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}

// Identity card (name + grade) with Ivylevel styling
function IdentityCard() {
  const name = useStudentStore((s) => s.profile.identity.name);
  const grade = useStudentStore((s) => s.profile.identity.grade);
  const setName = useStudentStore((s) => s.setName);
  const setGrade = useStudentStore((s) => s.setGrade);

  const grades: { value: Grade; label: string }[] = [
    { value: 9, label: 'Freshman (9th)' },
    { value: 10, label: 'Sophomore (10th)' },
    { value: 11, label: 'Junior (11th)' },
    { value: 12, label: 'Senior (12th)' },
    { value: 'gap', label: 'Gap Year' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card padding="lg">
        <CardContent className="space-y-8">
          <div>
            <label
              className="block text-lg font-semibold mb-3"
              style={{ color: '#641432' }}
            >
              What's your name?
            </label>
            <Input
              placeholder="Enter your first name"
              value={name}
              onChange={(e) => {
                logInput('Frame1', 'IdentityCard', 'identity.name', e.target.value);
                setName(e.target.value);
              }}
              leftElement={<User className="w-5 h-5" style={{ color: '#FF4A23' }} />}
            />
          </div>

          <div>
            <label
              className="block text-lg font-semibold mb-4"
              style={{ color: '#641432' }}
            >
              What grade are you in?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {grades.map((g) => (
                <button
                  key={g.value}
                  onClick={() => {
                    logInput('Frame1', 'IdentityCard', 'identity.grade', g.value);
                    setGrade(g.value);
                  }}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: grade === g.value ? '#FF4A23' : 'rgba(255, 255, 255, 0.9)',
                    border: grade === g.value ? '2px solid #FF4A23' : '1px solid #e5e7eb',
                    color: grade === g.value ? 'white' : '#6b7280',
                    transform: grade === g.value ? 'translateY(-2px)' : 'none',
                    boxShadow: grade === g.value ? '0 6px 16px rgba(254, 74, 34, 0.25)' : '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Target schools card with Ivylevel styling
function SchoolsCard() {
  const targetSchools = useStudentStore((s) => s.profile.target_schools);
  const toggleTargetSchool = useStudentStore((s) => s.toggleTargetSchool);

  const schools = Object.values(SCHOOL_DATABASE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-3xl mx-auto"
    >
      <Card padding="lg">
        <CardContent>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 74, 35, 0.1)' }}
            >
              <Target className="w-5 h-5" style={{ color: '#FF4A23' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: '#641432' }}>
                Select your dream schools
              </h3>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                Choose at least 1 school you're interested in
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {schools.map((school) => {
              const isSelected = targetSchools.includes(school.school_id);

              return (
                <button
                  key={school.school_id}
                  onClick={() => {
                    logInput('Frame1', 'SchoolsCard', 'target_schools', school.school_id);
                    toggleTargetSchool(school.school_id);
                  }}
                  className="relative p-4 rounded-xl transition-all duration-200 flex flex-col items-center justify-center min-h-[100px]"
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(255, 74, 35, 0.1)'
                      : 'rgba(255, 255, 255, 0.9)',
                    border: isSelected
                      ? '2px solid #FF4A23'
                      : '1px solid #e5e7eb',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    boxShadow: isSelected
                      ? '0 6px 16px rgba(254, 74, 34, 0.2)'
                      : '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  {/* School logo */}
                  <div className="mb-2 flex items-center justify-center">
                    <CollegeLogo
                      schoolId={school.school_id}
                      size={28}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                    {(school.base_acceptance_rate * 100).toFixed(1)}% accept
                  </p>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#FF4A23' }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>

          {targetSchools.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 rounded-xl flex items-center gap-3"
              style={{
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                border: '1px solid rgba(22, 163, 74, 0.2)',
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: '#16a34a' }} />
              <span className="font-medium" style={{ color: '#16a34a' }}>
                {targetSchools.length} school{targetSchools.length > 1 ? 's' : ''} selected
              </span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Major selection card with Ivylevel styling
function MajorCard() {
  const intendedMajor = useStudentStore((s) => s.profile.intended_major);
  const majorCertainty = useStudentStore((s) => s.profile.major_certainty);
  const setIntendedMajor = useStudentStore((s) => s.setIntendedMajor);
  const setMajorCertainty = useStudentStore((s) => s.setMajorCertainty);

  const popularMajors = [
    'Computer Science',
    'Engineering',
    'Biology',
    'Economics',
    'Pre-Med',
    'Mathematics',
    'Physics',
    'Political Science',
    'Psychology',
    'Business',
  ];

  const certaintyLevels: { value: MajorCertainty; label: string; description: string }[] = [
    { value: 'EXPLORING', label: 'Exploring', description: 'Still figuring it out' },
    { value: 'LIKELY', label: 'Likely', description: 'Pretty sure about this' },
    { value: 'LOCKED', label: 'Locked In', description: 'Definitely my path' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card padding="lg">
        <CardContent className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 74, 35, 0.1)' }}
              >
                <GraduationCap className="w-5 h-5" style={{ color: '#FF4A23' }} />
              </div>
              <label
                className="text-lg font-semibold"
                style={{ color: '#641432' }}
              >
                What do you want to study?
              </label>
            </div>

            <Input
              placeholder="e.g., Computer Science, Biology, Economics..."
              value={intendedMajor}
              onChange={(e) => {
                logInput('Frame1', 'MajorCard', 'intended_major', e.target.value);
                setIntendedMajor(e.target.value);
              }}
            />

            <div className="flex flex-wrap gap-2 mt-4">
              {popularMajors.map((major) => (
                <button
                  key={major}
                  onClick={() => {
                    logInput('Frame1', 'MajorCard', 'intended_major', major);
                    setIntendedMajor(major);
                  }}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: intendedMajor === major ? '#641432' : 'rgba(255, 229, 223, 0.8)',
                    color: intendedMajor === major ? 'white' : '#641432',
                    border: intendedMajor === major ? '2px solid #641432' : '1px solid #FFE5DF',
                    transform: intendedMajor === major ? 'translateY(-1px)' : 'none',
                    boxShadow: intendedMajor === major ? '0 4px 12px rgba(100, 20, 50, 0.2)' : 'none',
                  }}
                >
                  {major}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="block text-lg font-semibold mb-4"
              style={{ color: '#641432' }}
            >
              How certain are you?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {certaintyLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => {
                    logInput('Frame1', 'MajorCard', 'major_certainty', level.value);
                    setMajorCertainty(level.value);
                  }}
                  className="p-5 rounded-xl text-center transition-all duration-200"
                  style={{
                    backgroundColor: majorCertainty === level.value
                      ? 'rgba(255, 74, 35, 0.1)'
                      : 'rgba(255, 255, 255, 0.9)',
                    border: majorCertainty === level.value
                      ? '2px solid #FF4A23'
                      : '1px solid #e5e7eb',
                    transform: majorCertainty === level.value ? 'translateY(-2px)' : 'none',
                    boxShadow: majorCertainty === level.value
                      ? '0 6px 16px rgba(254, 74, 34, 0.2)'
                      : '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <p className="font-bold text-lg" style={{ color: '#641432' }}>
                    {level.label}
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
                    {level.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {intendedMajor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-5 rounded-xl"
              style={{
                backgroundColor: 'rgba(255, 74, 35, 0.08)',
                border: '1px solid rgba(255, 74, 35, 0.2)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 74, 35, 0.15)' }}
                >
                  <Rocket className="w-5 h-5" style={{ color: '#FF4A23' }} />
                </div>
                <div>
                  <span className="font-semibold" style={{ color: '#641432' }}>
                    Ready to explore {intendedMajor}!
                  </span>
                  <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
                    We'll analyze major-specific competitiveness at your target schools.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default Frame1Warmup;
