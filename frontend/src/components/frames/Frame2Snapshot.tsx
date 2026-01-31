'use client';

/**
 * Frame 2: Academic Snapshot
 *
 * STYLING: Uses BRAND_COLORS constants for consistent Ivylevel branding.
 * Never use dark-mode Tailwind classes (text-text-primary, bg-background-secondary, etc.)
 *
 * LAYOUT: Uses SplitFrameLayout with:
 * - Left: Input cards (GPA, Tests, Rigor, Awards)
 * - Right: InsightsPanel for real-time feedback
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentStore, useSessionStore, useAddRealtimeInsight } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';
import { FrameWrapper, CardNavigation } from '@/components/layout/AssessmentLayout';
import { SplitFrameLayout } from '@/components/layout/SplitFrameLayout';
import { InsightsPanel } from '@/components/insights';
import { RealtimeInsightGenerator } from '@/lib/insights/realtimeInsights';
import { useNotificationStore } from '@/lib/hooks/useInsightNotifications';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { logInput } from '@/lib/utils/dataFlowLogger';
import {
  BookOpen,
  Target,
  Award,
  TrendingUp,
  Sparkles,
  Check,
} from 'lucide-react';

const CARDS = ['gpa', 'tests', 'rigor', 'awards'] as const;
type CardType = (typeof CARDS)[number];

interface Frame2Props {
  onComplete: () => void;
}

export function Frame2Snapshot({ onComplete }: Frame2Props) {
  const [currentCard, setCurrentCard] = useState(0);
  const { startFrame, completeCard, nextCard, completeFrame } = useSessionStore();

  useEffect(() => {
    startFrame(2, CARDS.length);
  }, [startFrame]);

  const handleNext = useCallback(() => {
    completeCard(30);
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
      title="Academic Snapshot"
      subtitle="Let's capture your academic foundation"
    >
      <SplitFrameLayout
        rightPanel={
          <div className="sticky top-24">
            <InsightsPanel
              maxInsights={3}
              categories={['APTITUDE', 'HYPER_LOCAL', 'INSTITUTIONAL']}
              title="Academic Insights"
            />
          </div>
        }
      >
        {CARDS[currentCard] === 'gpa' && <GPACard key="gpa" />}
        {CARDS[currentCard] === 'tests' && <TestsCard key="tests" />}
        {CARDS[currentCard] === 'rigor' && <RigorCard key="rigor" />}
        {CARDS[currentCard] === 'awards' && <AwardsCard key="awards" />}

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

// GPA Input Card
function GPACard() {
  const profile = useStudentStore((s) => s.profile);
  const gpaWeighted = useStudentStore((s) => s.profile.aptitude.gpa_weighted);
  const gpaUnweighted = useStudentStore((s) => s.profile.aptitude.gpa_unweighted);
  const setGPA = useStudentStore((s) => s.setGPA);
  const addRealtimeInsight = useAddRealtimeInsight();

  const [weighted, setWeighted] = useState(gpaWeighted ?? 4.0);
  const [unweighted, setUnweighted] = useState(gpaUnweighted ?? 3.9);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleWeightedChange = (value: number) => {
    logInput('Frame2', 'GPACard', 'aptitude.gpa_weighted', value);
    setWeighted(value);
    setGPA(value, unweighted);

    // Debounce insight generation
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const updatedProfile = { ...profile, aptitude: { ...profile.aptitude, gpa_weighted: value } };
      const insight = RealtimeInsightGenerator.generateGPAInsight(updatedProfile);
      if (insight) {
        // Add to floating notification queue
        useNotificationStore.getState().addNotification(insight);
        // Also add to panel for history
        addRealtimeInsight(insight);
      }
    }, 500);
  };

  const handleUnweightedChange = (value: number) => {
    logInput('Frame2', 'GPACard', 'aptitude.gpa_unweighted', value);
    setUnweighted(value);
    setGPA(weighted, value);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const getGPAFeedback = (gpa: number, type: 'weighted' | 'unweighted') => {
    if (type === 'weighted') {
      if (gpa >= 4.5) return { text: 'Exceptional! Top 1%', color: BRAND_COLORS.success };
      if (gpa >= 4.0) return { text: 'Excellent! Top 10%', color: BRAND_COLORS.primary };
      if (gpa >= 3.7) return { text: 'Strong! Competitive', color: BRAND_COLORS.warning };
      return { text: 'Room to improve', color: BRAND_COLORS.textSecondary };
    } else {
      if (gpa >= 3.95) return { text: 'Near-perfect!', color: BRAND_COLORS.success };
      if (gpa >= 3.8) return { text: 'Excellent range', color: BRAND_COLORS.primary };
      if (gpa >= 3.5) return { text: 'Good standing', color: BRAND_COLORS.warning };
      return { text: 'Upward trend matters', color: BRAND_COLORS.textSecondary };
    }
  };

  const weightedFeedback = getGPAFeedback(weighted, 'weighted');
  const unweightedFeedback = getGPAFeedback(unweighted, 'unweighted');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card padding="lg">
        <CardContent className="space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.primaryBg }}
            >
              <BookOpen className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                Grade Point Average
              </h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Your academic foundation
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Slider
                label="Weighted GPA"
                min={2.0}
                max={5.0}
                step={0.01}
                value={weighted}
                onChange={(e) => handleWeightedChange(parseFloat(e.target.value))}
                formatValue={(v) => v.toFixed(2)}
                hint="Includes AP/Honors boost"
              />
              <p className="text-sm mt-1" style={{ color: weightedFeedback.color }}>
                {weightedFeedback.text}
              </p>
            </div>

            <div>
              <Slider
                label="Unweighted GPA"
                min={2.0}
                max={4.0}
                step={0.01}
                value={unweighted}
                onChange={(e) => handleUnweightedChange(parseFloat(e.target.value))}
                formatValue={(v) => v.toFixed(2)}
                hint="Standard 4.0 scale"
              />
              <p className="text-sm mt-1" style={{ color: unweightedFeedback.color }}>
                {unweightedFeedback.text}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Tests Card (SAT/ACT)
function TestsCard() {
  const profile = useStudentStore((s) => s.profile);
  const satTotal = useStudentStore((s) => s.profile.aptitude.sat_total);
  const actTotal = useStudentStore((s) => s.profile.aptitude.act_total);
  const testOptional = useStudentStore((s) => s.profile.aptitude.test_optional);
  const setSAT = useStudentStore((s) => s.setSAT);
  const setACT = useStudentStore((s) => s.setACT);
  const setTestOptional = useStudentStore((s) => s.setTestOptional);
  const addRealtimeInsight = useAddRealtimeInsight();

  const [testType, setTestType] = useState<'SAT' | 'ACT' | 'NONE'>(
    testOptional ? 'NONE' : satTotal ? 'SAT' : actTotal ? 'ACT' : 'SAT'
  );

  const [sat, setSatValue] = useState(satTotal ?? 1400);
  const [act, setActValue] = useState(actTotal ?? 32);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const generateTestInsight = useCallback((updatedProfile: typeof profile) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const insight = RealtimeInsightGenerator.generateTestScoreInsight(updatedProfile);
      if (insight) {
        // Add to floating notification queue
        useNotificationStore.getState().addNotification(insight);
        // Also add to panel for history
        addRealtimeInsight(insight);
      }
    }, 500);
  }, [addRealtimeInsight]);

  const handleSATChange = (value: number) => {
    logInput('Frame2', 'TestsCard', 'aptitude.sat_total', value);
    setSatValue(value);
    setSAT(value);
    const updatedProfile = { ...profile, aptitude: { ...profile.aptitude, sat_total: value, test_optional: false } };
    generateTestInsight(updatedProfile);
  };

  const handleACTChange = (value: number) => {
    logInput('Frame2', 'TestsCard', 'aptitude.act_total', value);
    setActValue(value);
    setACT(value);
    const updatedProfile = { ...profile, aptitude: { ...profile.aptitude, act_total: value, test_optional: false } };
    generateTestInsight(updatedProfile);
  };

  const handleTestTypeChange = (type: 'SAT' | 'ACT' | 'NONE') => {
    logInput('Frame2', 'TestsCard', 'aptitude.test_optional', type === 'NONE');
    setTestType(type);
    if (type === 'NONE') {
      setTestOptional(true);
      const updatedProfile = { ...profile, aptitude: { ...profile.aptitude, test_optional: true } };
      generateTestInsight(updatedProfile);
    } else if (type === 'SAT') {
      setTestOptional(false);
      setSAT(sat);
    } else {
      setTestOptional(false);
      setACT(act);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // 🆕 FIX: Sync default SAT/ACT value to store on mount
  // This ensures the value is saved even if user doesn't drag the slider
  useEffect(() => {
    if (testType === 'SAT' && satTotal === null) {
      setSAT(sat); // Sync default 1400 to store
    } else if (testType === 'ACT' && actTotal === null) {
      setACT(act); // Sync default 32 to store
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const getSATPercentile = (score: number) => {
    if (score >= 1550) return '99th';
    if (score >= 1500) return '98th';
    if (score >= 1450) return '96th';
    if (score >= 1400) return '93rd';
    if (score >= 1350) return '90th';
    return '<90th';
  };

  const getACTPercentile = (score: number) => {
    if (score >= 35) return '99th';
    if (score >= 34) return '98th';
    if (score >= 33) return '97th';
    if (score >= 32) return '95th';
    if (score >= 30) return '93rd';
    return '<90th';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card padding="lg">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.primaryBg }}
            >
              <Target className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                Standardized Tests
              </h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                SAT or ACT scores
              </p>
            </div>
          </div>

          {/* Test type selector */}
          <div className="grid grid-cols-3 gap-2">
            {(['SAT', 'ACT', 'NONE'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleTestTypeChange(type)}
                className="py-3 rounded-xl font-medium transition-all"
                style={testType === type ? {
                  backgroundColor: BRAND_COLORS.primary,
                  color: 'white',
                  boxShadow: BRAND_COLORS.shadowPrimary,
                } : {
                  backgroundColor: BRAND_COLORS.bgPrimary,
                  color: BRAND_COLORS.textSecondary,
                  border: `1px solid ${BRAND_COLORS.borderLight}`,
                }}
              >
                {type === 'NONE' ? 'Test Optional' : type}
              </button>
            ))}
          </div>

          {testType === 'SAT' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <Slider
                label="SAT Total Score"
                min={1000}
                max={1600}
                step={10}
                value={sat}
                onChange={(e) => handleSATChange(parseInt(e.target.value))}
              />
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: BRAND_COLORS.textMuted }}>Percentile:</span>
                <span className="font-semibold" style={{ color: BRAND_COLORS.primary }}>
                  {getSATPercentile(sat)}
                </span>
              </div>
            </motion.div>
          )}

          {testType === 'ACT' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <Slider
                label="ACT Composite Score"
                min={20}
                max={36}
                step={1}
                value={act}
                onChange={(e) => handleACTChange(parseInt(e.target.value))}
              />
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: BRAND_COLORS.textMuted }}>Percentile:</span>
                <span className="font-semibold" style={{ color: BRAND_COLORS.primary }}>
                  {getACTPercentile(act)}
                </span>
              </div>
            </motion.div>
          )}

          {testType === 'NONE' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl"
              style={{
                backgroundColor: BRAND_COLORS.bgWarning,
                border: `1px solid rgba(217, 119, 6, 0.2)`,
              }}
            >
              <p className="text-sm" style={{ color: BRAND_COLORS.textPrimary }}>
                Many schools are test-optional. Your GPA and other factors will be weighted more heavily.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Rigor Card (AP courses)
function RigorCard() {
  const profile = useStudentStore((s) => s.profile);
  const apCount = useStudentStore((s) => s.profile.aptitude.ap_count);
  const apAvgScore = useStudentStore((s) => s.profile.aptitude.ap_avg_score);
  const ibDiploma = useStudentStore((s) => s.profile.aptitude.ib_diploma);
  const setAPCourses = useStudentStore((s) => s.setAPCourses);
  const setAptitude = useStudentStore((s) => s.setAptitude);
  const addRealtimeInsight = useAddRealtimeInsight();

  const [count, setCount] = useState(apCount ?? 6);
  const [avgScore, setAvgScore] = useState(apAvgScore ?? 4.0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const generateRigorInsight = useCallback((updatedProfile: typeof profile) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const insight = RealtimeInsightGenerator.generateRigorInsight(updatedProfile);
      if (insight) {
        // Add to floating notification queue
        useNotificationStore.getState().addNotification(insight);
        // Also add to panel for history
        addRealtimeInsight(insight);
      }
    }, 500);
  }, [addRealtimeInsight]);

  const handleCountChange = (value: number) => {
    logInput('Frame2', 'RigorCard', 'aptitude.ap_count', value);
    setCount(value);
    setAPCourses(value, avgScore);
    const updatedProfile = { ...profile, aptitude: { ...profile.aptitude, ap_count: value } };
    generateRigorInsight(updatedProfile);
  };

  const handleAvgScoreChange = (value: number) => {
    logInput('Frame2', 'RigorCard', 'aptitude.ap_avg_score', value);
    setAvgScore(value);
    setAPCourses(count, value);
  };

  const handleIBToggle = () => {
    const newIBDiploma = !ibDiploma;
    logInput('Frame2', 'RigorCard', 'aptitude.ib_diploma', newIBDiploma);
    setAptitude({ ib_diploma: newIBDiploma });
    if (newIBDiploma) {
      const updatedProfile = { ...profile, aptitude: { ...profile.aptitude, ib_diploma: true } };
      generateRigorInsight(updatedProfile);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const getRigorLevel = (count: number) => {
    if (count >= 12) return { text: 'Maximum rigor', color: BRAND_COLORS.success };
    if (count >= 8) return { text: 'Very rigorous', color: BRAND_COLORS.primary };
    if (count >= 5) return { text: 'Solid rigor', color: BRAND_COLORS.warning };
    return { text: 'Consider more APs', color: BRAND_COLORS.textSecondary };
  };

  const rigorLevel = getRigorLevel(count);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card padding="lg">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.primaryBg }}
            >
              <TrendingUp className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                Course Rigor
              </h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                AP/IB coursework
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Slider
                label="Number of AP Courses"
                min={0}
                max={15}
                step={1}
                value={count}
                onChange={(e) => handleCountChange(parseInt(e.target.value))}
                hint="Total across all years"
              />
              <p className="text-sm mt-1" style={{ color: rigorLevel.color }}>
                {rigorLevel.text}
              </p>
            </div>

            <Slider
              label="Average AP Score"
              min={1}
              max={5}
              step={0.1}
              value={avgScore}
              onChange={(e) => handleAvgScoreChange(parseFloat(e.target.value))}
              formatValue={(v) => v.toFixed(1)}
              hint="5 = highest possible"
            />

            <div
              className="flex items-center justify-between p-4 rounded-xl"
              style={{
                backgroundColor: BRAND_COLORS.bgPrimary,
                border: `1px solid ${BRAND_COLORS.borderLight}`,
              }}
            >
              <div>
                <p className="font-medium" style={{ color: BRAND_COLORS.textHeading }}>
                  IB Diploma Program?
                </p>
                <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                  Full IB curriculum
                </p>
              </div>
              <button
                onClick={handleIBToggle}
                className="w-12 h-6 rounded-full transition-colors relative"
                style={{
                  backgroundColor: ibDiploma ? BRAND_COLORS.primary : BRAND_COLORS.borderLight,
                }}
              >
                <motion.div
                  animate={{ x: ibDiploma ? 24 : 2 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Awards Card
function AwardsCard() {
  const academicAwards = useStudentStore((s) => s.profile.aptitude.academic_awards);
  const setAcademicAwards = useStudentStore((s) => s.setAcademicAwards);

  const awardOptions = [
    { id: 'AP_SCHOLAR', label: 'AP Scholar', tier: 'common' },
    { id: 'AP_SCHOLAR_DISTINCTION', label: 'AP Scholar with Distinction', tier: 'good' },
    { id: 'NATIONAL_MERIT_SEMIFINALIST', label: 'National Merit Semifinalist', tier: 'excellent' },
    { id: 'NATIONAL_MERIT_FINALIST', label: 'National Merit Finalist', tier: 'excellent' },
    { id: 'USAMO_QUALIFIER', label: 'USAMO Qualifier', tier: 'exceptional' },
    { id: 'USABO_QUALIFIER', label: 'USABO Qualifier', tier: 'exceptional' },
    { id: 'USACO_GOLD', label: 'USACO Gold+', tier: 'exceptional' },
    { id: 'ISEF_FINALIST', label: 'ISEF Finalist', tier: 'exceptional' },
    { id: 'REGENERON_STS', label: 'Regeneron STS Scholar', tier: 'exceptional' },
    { id: 'STATE_SCIENCE_FAIR', label: 'State Science Fair Winner', tier: 'good' },
  ];

  const toggleAward = (awardId: string) => {
    const newAwards = academicAwards.includes(awardId)
      ? academicAwards.filter((a) => a !== awardId)
      : [...academicAwards, awardId];
    logInput('Frame2', 'AwardsCard', 'aptitude.academic_awards', newAwards);
    setAcademicAwards(newAwards);
  };

  const getTierStyles = (tier: string, isSelected: boolean) => {
    if (!isSelected) {
      return {
        backgroundColor: BRAND_COLORS.bgPrimary,
        border: `1px solid ${BRAND_COLORS.borderLight}`,
      };
    }
    switch (tier) {
      case 'exceptional':
        return {
          backgroundColor: BRAND_COLORS.bgSuccess,
          border: `2px solid ${BRAND_COLORS.success}`,
        };
      case 'excellent':
        return {
          backgroundColor: BRAND_COLORS.primaryBg,
          border: `2px solid ${BRAND_COLORS.primary}`,
        };
      case 'good':
        return {
          backgroundColor: BRAND_COLORS.bgWarning,
          border: `2px solid ${BRAND_COLORS.warning}`,
        };
      default:
        return {
          backgroundColor: BRAND_COLORS.bgPrimary,
          border: `1px solid ${BRAND_COLORS.borderLight}`,
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card padding="lg">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
            >
              <Award className="w-5 h-5" style={{ color: BRAND_COLORS.warning }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                Academic Recognition
              </h3>
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Select any that apply
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {awardOptions.map((award) => {
              const isSelected = academicAwards.includes(award.id);
              const tierStyles = getTierStyles(award.tier, isSelected);

              return (
                <button
                  key={award.id}
                  onClick={() => toggleAward(award.id)}
                  className="flex items-center justify-between p-3 rounded-xl transition-all text-left"
                  style={tierStyles}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: isSelected ? BRAND_COLORS.textHeading : BRAND_COLORS.textSecondary }}
                  >
                    {award.label}
                  </span>
                  {isSelected ? (
                    <Check className="w-4 h-4" style={{ color: BRAND_COLORS.success }} />
                  ) : (
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ borderColor: BRAND_COLORS.borderDefault }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {academicAwards.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm"
              style={{ color: BRAND_COLORS.success }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{academicAwards.length} award{academicAwards.length > 1 ? 's' : ''} will boost your profile!</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default Frame2Snapshot;
