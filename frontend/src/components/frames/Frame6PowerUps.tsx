/**
 * IvyQuest v3.0 — Frame 6: Power-Ups
 *
 * STYLING: Uses BRAND_COLORS constants for consistent Ivylevel branding.
 *
 * @version 2.0.0
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useResultsStore, useSessionStore, useStudentStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { FrameWrapper, CardNavigation } from '@/components/layout/AssessmentLayout';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  Rocket,
  Clock,
  TrendingUp,
  Star,
  CheckCircle,
  Target,
  Zap,
  BookOpen,
  Award,
  Users,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Booster } from '@/lib/types/student';

// Booster templates (subset of 47)
const BOOSTER_TEMPLATES: Booster[] = [
  {
    booster_id: 'AP_ADD_STEM',
    title: 'Add AP STEM Course',
    description: 'Take an additional AP course in science or math to demonstrate rigor',
    category: 'APTITUDE',
    effort_level: 'MEDIUM',
    time_weeks: 36,
    hours_per_week: 8,
    total_hours: 288,
    impact_attributes: ['rigor_normalized'],
    expected_lift: { aptitude: 5, passion: 0, community: 0, narrative: 2 },
    roi_score: 0.75,
    prerequisites: ['junior_or_senior', 'gpa_above_3.5'],
    action_steps: [
      'Register for AP course during enrollment',
      'Study consistently throughout the year',
      'Take AP exam in May',
    ],
    success_metric: 'Score 4+ on AP exam',
  },
  {
    booster_id: 'SAT_RETAKE',
    title: 'SAT Retake with Prep',
    description: 'Retake the SAT with focused preparation to improve score',
    category: 'APTITUDE',
    effort_level: 'MEDIUM',
    time_weeks: 8,
    hours_per_week: 10,
    total_hours: 80,
    impact_attributes: ['sat_normalized'],
    expected_lift: { aptitude: 8, passion: 0, community: 0, narrative: 0 },
    roi_score: 0.85,
    prerequisites: ['sat_below_1500'],
    action_steps: [
      'Diagnose weak areas with practice tests',
      'Use targeted prep materials (Khan Academy, etc.)',
      'Take 4+ full practice tests',
      'Register for next available SAT date',
    ],
    success_metric: 'Improve SAT by 50+ points',
  },
  {
    booster_id: 'RESEARCH_SUMMER',
    title: 'Summer Research Program',
    description: 'Participate in a university summer research program',
    category: 'PASSION',
    effort_level: 'HIGH',
    time_weeks: 8,
    hours_per_week: 40,
    total_hours: 320,
    impact_attributes: ['research_normalized', 'project_normalized'],
    expected_lift: { aptitude: 3, passion: 12, community: 0, narrative: 8 },
    roi_score: 0.92,
    prerequisites: ['junior_or_senior', 'gpa_above_3.7'],
    action_steps: [
      'Research programs (RSI, SSRP, etc.) by January',
      'Apply with strong essays and recommendations',
      'Complete research and present findings',
      'Ask for recommendation letter from mentor',
    ],
    success_metric: 'Complete research project with mentor letter',
  },
  {
    booster_id: 'LEADERSHIP_FOUND',
    title: 'Found a Club/Organization',
    description: 'Start a new club or organization addressing a gap at your school',
    category: 'PASSION',
    effort_level: 'HIGH',
    time_weeks: 20,
    hours_per_week: 5,
    total_hours: 100,
    impact_attributes: ['leadership_normalized', 'project_normalized'],
    expected_lift: { aptitude: 0, passion: 10, community: 5, narrative: 10 },
    roi_score: 0.88,
    prerequisites: ['passion_for_cause'],
    action_steps: [
      'Identify a need or gap at your school/community',
      'Draft club charter and recruit founding members',
      'Get faculty advisor and school approval',
      'Plan and execute inaugural events',
      'Document impact and growth',
    ],
    success_metric: '20+ active members, 3+ events hosted',
  },
  {
    booster_id: 'COMPETITION_NATIONAL',
    title: 'Enter National Competition',
    description: 'Compete in a prestigious national competition in your field',
    category: 'PASSION',
    effort_level: 'HIGH',
    time_weeks: 16,
    hours_per_week: 8,
    total_hours: 128,
    impact_attributes: ['ec_awards_normalized'],
    expected_lift: { aptitude: 5, passion: 15, community: 0, narrative: 8 },
    roi_score: 0.80,
    prerequisites: ['strong_in_field'],
    action_steps: [
      'Identify relevant competitions (USAMO, ISEF, DECA, etc.)',
      'Register and prepare thoroughly',
      'Qualify through regional rounds',
      'Compete at national level',
    ],
    success_metric: 'National finalist or winner',
  },
  {
    booster_id: 'SERVICE_SCALE',
    title: 'Scale Community Service Project',
    description: 'Expand your service initiative to reach more people',
    category: 'COMMUNITY',
    effort_level: 'MEDIUM',
    time_weeks: 12,
    hours_per_week: 6,
    total_hours: 72,
    impact_attributes: ['impact_normalized', 'hours_normalized'],
    expected_lift: { aptitude: 0, passion: 3, community: 12, narrative: 5 },
    roi_score: 0.78,
    prerequisites: ['existing_service_project'],
    action_steps: [
      'Assess current impact and identify growth areas',
      'Recruit volunteers and partners',
      'Expand to new locations or demographics',
      'Document and quantify increased impact',
    ],
    success_metric: '2x increase in people served',
  },
  {
    booster_id: 'SPIKE_NARRATIVE',
    title: 'Develop Your Spike Narrative',
    description: 'Create a cohesive story connecting your activities to your goals',
    category: 'NARRATIVE',
    effort_level: 'LOW',
    time_weeks: 4,
    hours_per_week: 3,
    total_hours: 12,
    impact_attributes: [],
    expected_lift: { aptitude: 0, passion: 5, community: 0, narrative: 15 },
    roi_score: 0.95,
    prerequisites: [],
    action_steps: [
      'Map all activities to core themes',
      'Identify the "why" behind your choices',
      'Practice articulating your story',
      'Get feedback from counselors/mentors',
    ],
    success_metric: 'Clear, compelling narrative for applications',
  },
  {
    booster_id: 'ESSAY_POLISH',
    title: 'Professional Essay Review',
    description: 'Get expert feedback on your college application essays',
    category: 'NARRATIVE',
    effort_level: 'MEDIUM',
    time_weeks: 6,
    hours_per_week: 5,
    total_hours: 30,
    impact_attributes: [],
    expected_lift: { aptitude: 0, passion: 0, community: 0, narrative: 12 },
    roi_score: 0.88,
    prerequisites: ['essay_drafts_ready'],
    action_steps: [
      'Complete rough drafts of all essays',
      'Get feedback from 2-3 trusted readers',
      'Revise based on feedback',
      'Polish grammar and flow',
      'Final review before submission',
    ],
    success_metric: 'Essays that authentically tell your story',
  },
];

interface Frame6Props {
  onComplete: () => void;
}

export function Frame6PowerUps({ onComplete }: Frame6Props) {
  const [selectedBoosters, setSelectedBoosters] = useState<string[]>([]);
  const [expandedBooster, setExpandedBooster] = useState<string | null>(null);
  const { startFrame, completeFrame, completeAssessment, setProfileId, session_id } = useSessionStore();
  const results = useResultsStore((s) => s.results);
  const ivyScore = useResultsStore((s) => s.ivy_score);

  useEffect(() => {
    startFrame(6, 1);
  }, [startFrame]);

  const handleComplete = useCallback(async () => {
    completeFrame();
    completeAssessment();

    // Get the REAL user_id from Supabase auth (not session_id)
    // This ensures the profile_id matches the assessment data in Supabase
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.id) {
      setProfileId(user.id);
      console.log('[Frame6] Profile ID set to auth user:', user.id);
    } else if (session_id) {
      // Fallback to session_id for non-authenticated users
      setProfileId(session_id);
      console.log('[Frame6] Profile ID set to session (fallback):', session_id);
    }

    onComplete();
  }, [completeFrame, completeAssessment, setProfileId, session_id, onComplete]);

  const toggleBooster = (boosterId: string) => {
    setSelectedBoosters((prev) =>
      prev.includes(boosterId)
        ? prev.filter((id) => id !== boosterId)
        : prev.length < 5 ? [...prev, boosterId] : prev
    );
  };

  const toggleExpanded = (boosterId: string) => {
    setExpandedBooster((prev) => (prev === boosterId ? null : boosterId));
  };

  // Calculate projected improvement
  const projectedLift = selectedBoosters.reduce(
    (acc, id) => {
      const booster = BOOSTER_TEMPLATES.find((b) => b.booster_id === id);
      if (booster?.expected_lift) {
        acc.aptitude += booster.expected_lift.aptitude;
        acc.passion += booster.expected_lift.passion;
        acc.community += booster.expected_lift.community;
        acc.narrative += booster.expected_lift.narrative;
      }
      return acc;
    },
    { aptitude: 0, passion: 0, community: 0, narrative: 0 }
  );

  const totalLift = Math.round(
    (projectedLift.aptitude * 0.3 +
      projectedLift.passion * 0.35 +
      projectedLift.community * 0.25 +
      projectedLift.narrative * 0.1)
  );

  const currentScore = ivyScore?.total_score || 70;
  const projectedScore = Math.min(99, currentScore + totalLift);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'APTITUDE': return BookOpen;
      case 'PASSION': return Star;
      case 'COMMUNITY': return Users;
      case 'NARRATIVE': return Lightbulb;
      default: return Rocket;
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'APTITUDE': return { color: BRAND_COLORS.primary, backgroundColor: BRAND_COLORS.primaryBg };
      case 'PASSION': return { color: BRAND_COLORS.warning, backgroundColor: BRAND_COLORS.bgWarning };
      case 'COMMUNITY': return { color: BRAND_COLORS.secondary, backgroundColor: BRAND_COLORS.secondaryBg };
      case 'NARRATIVE': return { color: BRAND_COLORS.success, backgroundColor: BRAND_COLORS.bgSuccess };
      default: return { color: BRAND_COLORS.textSecondary, backgroundColor: BRAND_COLORS.bgSecondary };
    }
  };

  const getEffortStyle = (effort: string) => {
    switch (effort) {
      case 'LOW': return { color: BRAND_COLORS.success, backgroundColor: BRAND_COLORS.bgSuccess };
      case 'MEDIUM': return { color: BRAND_COLORS.warning, backgroundColor: BRAND_COLORS.bgWarning };
      case 'HIGH': return { color: BRAND_COLORS.error, backgroundColor: BRAND_COLORS.bgError };
      default: return { color: BRAND_COLORS.textSecondary, backgroundColor: BRAND_COLORS.bgSecondary };
    }
  };

  return (
    <FrameWrapper
      title="Power-Ups"
      subtitle="Select boosters to improve your profile"
    >
      <div className="space-y-6">
        {/* Projection card */}
        <Card
          padding="lg"
          style={{
            borderColor: `${BRAND_COLORS.primary}30`,
            backgroundColor: BRAND_COLORS.primaryBg,
          }}
        >
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: BRAND_COLORS.primaryBg }}
                >
                  <TrendingUp className="w-5 h-5" style={{ color: BRAND_COLORS.primary }} />
                </div>
                <div>
                  <h3
                    className="font-semibold"
                    style={{ color: BRAND_COLORS.textHeading }}
                  >
                    Projected Impact
                  </h3>
                  <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                    {selectedBoosters.length} booster{selectedBoosters.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: BRAND_COLORS.textHeading }}
                  >
                    {currentScore}
                  </span>
                  {totalLift > 0 && (
                    <>
                      <ArrowRight className="w-5 h-5" style={{ color: BRAND_COLORS.success }} />
                      <span
                        className="text-2xl font-bold"
                        style={{ color: BRAND_COLORS.success }}
                      >
                        {projectedScore}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>Ivy+ Score</p>
              </div>
            </div>

            {totalLift > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-4 gap-2 pt-4 border-t"
                style={{ borderColor: BRAND_COLORS.borderLight }}
              >
                {[
                  { label: 'Aptitude', value: projectedLift.aptitude },
                  { label: 'Passion', value: projectedLift.passion },
                  { label: 'Community', value: projectedLift.community },
                  { label: 'Narrative', value: projectedLift.narrative },
                ].map((cat) => (
                  <div key={cat.label} className="text-center">
                    <div
                      className="text-lg font-bold"
                      style={{ color: BRAND_COLORS.success }}
                    >
                      +{cat.value}
                    </div>
                    <div className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                      {cat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Boosters grid */}
        <div className="space-y-3">
          {BOOSTER_TEMPLATES.map((booster, idx) => {
            const Icon = getCategoryIcon(booster.category);
            const categoryStyle = getCategoryStyle(booster.category);
            const effortStyle = getEffortStyle(booster.effort_level || 'MEDIUM');
            const boosterId = booster.booster_id || `booster_${idx}`;
            const isSelected = selectedBoosters.includes(boosterId);
            const isExpanded = expandedBooster === boosterId;

            return (
              <motion.div
                key={boosterId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  padding="none"
                  className="transition-all overflow-hidden"
                  style={isSelected ? {
                    boxShadow: `0 0 0 2px ${BRAND_COLORS.primary}`,
                  } : undefined}
                >
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={categoryStyle}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3
                              className="font-semibold"
                              style={{ color: BRAND_COLORS.textHeading }}
                            >
                              {booster.title}
                            </h3>
                            <p
                              className="text-sm mt-1"
                              style={{ color: BRAND_COLORS.textMuted }}
                            >
                              {booster.description}
                            </p>
                          </div>

                          <button
                            onClick={() => toggleBooster(boosterId)}
                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                            style={
                              isSelected
                                ? {
                                    backgroundColor: BRAND_COLORS.primary,
                                    borderColor: BRAND_COLORS.primary,
                                  }
                                : {
                                    borderColor: BRAND_COLORS.borderDefault,
                                  }
                            }
                          >
                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                          </button>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-3 mt-3">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={effortStyle}
                          >
                            {booster.effort_level || 'MEDIUM'} Effort
                          </span>
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: BRAND_COLORS.textMuted }}
                          >
                            <Clock className="w-3 h-3" />
                            {booster.total_hours || 0}h total
                          </span>
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: BRAND_COLORS.textMuted }}
                          >
                            <TrendingUp className="w-3 h-3" />
                            ROI: {Math.round((booster.roi_score || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={() => toggleExpanded(boosterId)}
                      className="w-full mt-3 pt-3 border-t flex items-center justify-center gap-1 text-sm transition-colors"
                      style={{
                        borderColor: BRAND_COLORS.borderLight,
                        color: BRAND_COLORS.textMuted,
                      }}
                    >
                      {isExpanded ? (
                        <>
                          <span>Less details</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>View action steps</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t"
                          style={{ borderColor: BRAND_COLORS.borderLight }}
                        >
                          <h4
                            className="text-sm font-medium mb-2"
                            style={{ color: BRAND_COLORS.textHeading }}
                          >
                            Action Steps:
                          </h4>
                          <ol className="space-y-2">
                            {(booster.action_steps || []).map((step, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm"
                                style={{ color: BRAND_COLORS.textSecondary }}
                              >
                                <span
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                                  style={{
                                    backgroundColor: BRAND_COLORS.bgSecondary,
                                    color: BRAND_COLORS.textMuted,
                                  }}
                                >
                                  {i + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>

                          {booster.success_metric && (
                            <div
                              className="mt-4 p-3 rounded-lg border"
                              style={{
                                backgroundColor: BRAND_COLORS.bgSuccess,
                                borderColor: `${BRAND_COLORS.success}30`,
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" style={{ color: BRAND_COLORS.success }} />
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: BRAND_COLORS.success }}
                                >
                                  Success Metric:
                                </span>
                              </div>
                              <p
                                className="text-sm mt-1"
                                style={{ color: BRAND_COLORS.textSecondary }}
                              >
                                {booster.success_metric}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Complete button */}
        <div className="pt-4">
          <Button
            size="lg"
            fullWidth
            onClick={handleComplete}
            rightIcon={<Zap className="w-5 h-5" />}
          >
            Complete Assessment
          </Button>
          <p
            className="text-center text-sm mt-3"
            style={{ color: BRAND_COLORS.textMuted }}
          >
            Your results will be saved and you can adjust boosters anytime
          </p>
        </div>
      </div>
    </FrameWrapper>
  );
}

export default Frame6PowerUps;
