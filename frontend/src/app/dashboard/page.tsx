/**
 * Command Deck Dashboard - v13.1
 * Tabbed interface with real backend integration
 * Uses hooks to call /api/score and real engines
 *
 * v5.2 Data Unification: Uses useProfileIdentity for DB-sourced identity data
 */
'use client';

import { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { useStudentStore } from '@/lib/store/useStudentStore';
import { useResultsStore } from '@/lib/store/useResultsStore';
import { logout, startFreshAssessment } from '@/lib/session/sessionManager';
import { useAuth } from '@/lib/auth/AuthProvider';
import { deleteUserData } from '@/lib/services/assessmentService';
import { TabHeader } from '@/components/shared/TabHeader';
import { AssessmentTab } from '@/components/tabs/AssessmentTab';
import { GamePlanTab } from '@/components/tabs/GamePlanTab';
import { PreparationTab } from '@/components/tabs/PreparationTab';
import { GrowthTab } from '@/components/tabs/GrowthTab';
import { MultiAgentTab } from '@/components/dashboard/MultiAgentTab';
import { ExecutionTab } from '@/components/tabs/ExecutionTab';
import { type TabId, COLORS, getTierFromScore } from '@/lib/constants/design';

// Import real hooks for backend integration
import {
  useScoring,
  useIvyScore,
  useSchoolProbabilities,
  useArchetype,
  useFactors,
} from '@/lib/hooks/useScoring';
import { useGamePlan, usePreparationData } from '@/lib/hooks/useGamePlan';
import { useInsights } from '@/lib/hooks/useInsights';
import { useUserData } from '@/lib/hooks/useUserData';
import { agentV2Api } from '@/lib/api/agentV2Client';

// v5.2: Import profile identity hook for DB-sourced data
import { useProfileIdentity, useInvalidateProfileIdentity } from '@/hooks/useProfileIdentity';

// v5.3: Import event bus for cross-tab notifications
import { useEventBus } from '@/lib/events/bus';

const mockGamePlanData = {
  targetProfile: {
    name: 'STEM Innovator + Community Leader',
    narrative: 'A passionate technologist who bridges the gap between cutting-edge research and community impact, using robotics and AI to solve local problems.',
  },
  ecStrategy: [
    { title: 'Robotics Club President', category: 'Leadership', role: 'President', hoursPerWeek: 12, impact: 'High', years: 'Y1-Y4' },
    { title: 'STEM Tutoring Program', category: 'Service', role: 'Founder', hoursPerWeek: 5, impact: 'Medium', years: 'Y2-Y4' },
    { title: 'Research Internship', category: 'Academic', role: 'Research Assistant', hoursPerWeek: 15, impact: 'High', years: 'Y3 Summer' },
  ],
  targetSchools: [
    { name: 'MIT', tier: 'Reach' as const },
    { name: 'Stanford', tier: 'Reach' as const },
    { name: 'CMU', tier: 'Target' as const },
    { name: 'Georgia Tech', tier: 'Safety' as const },
  ],
  awards: [
    { title: 'USACO Gold', description: 'Programming competition' },
    { title: 'Science Olympiad State', description: 'Top 10 placement' },
  ],
  summerPrograms: [
    { title: 'MIT MITES', description: 'STEM intensive' },
    { title: 'RSI', description: 'Research Science Institute' },
  ],
  phases: [
    {
      id: 'phase1',
      name: 'Foundation Building',
      dateRange: 'Sep 2024 - Dec 2024',
      goal: 'Establish leadership positions and begin research exploration',
      completionPercent: 100,
      milestones: [
        { id: 'm1', title: 'Join robotics club leadership', status: 'completed' as const, targetDate: 'Oct 2024' },
        { id: 'm2', title: 'Start tutoring program', status: 'completed' as const, targetDate: 'Nov 2024' },
      ],
    },
    {
      id: 'phase2',
      name: 'Skill Development',
      dateRange: 'Jan 2025 - Apr 2025',
      goal: 'Deepen technical skills and expand impact',
      completionPercent: 65,
      milestones: [
        { id: 'm3', title: 'Complete USACO Silver', status: 'completed' as const, targetDate: 'Feb 2025' },
        { id: 'm4', title: 'Launch community robotics workshop', status: 'in_progress' as const, targetDate: 'Mar 2025' },
        { id: 'm5', title: 'Apply to summer research programs', status: 'pending' as const, targetDate: 'Apr 2025' },
      ],
    },
    {
      id: 'phase3',
      name: 'Peak Performance',
      dateRange: 'May 2025 - Aug 2025',
      goal: 'Summer program and competition achievements',
      completionPercent: 0,
      milestones: [
        { id: 'm6', title: 'Attend summer research program', status: 'pending' as const, targetDate: 'Jun-Aug 2025' },
        { id: 'm7', title: 'Compete in national robotics competition', status: 'pending' as const, targetDate: 'Jul 2025' },
      ],
    },
  ],
  currentPhase: 'phase2',
  actions: [
    { id: '1', title: 'Draft personal essay outline', description: 'Create structured outline with key experiences', category: 'narrative', priority: 'critical' as const, edgePoints: 50, timeEstimate: '2 hours' },
    { id: '2', title: 'Schedule robotics workshop venue', description: 'Book community center for March workshop', category: 'activities', priority: 'high' as const, edgePoints: 30, timeEstimate: '1 hour' },
    { id: '3', title: 'Complete RSI application', description: 'Finish essays and gather recommendations', category: 'academics', priority: 'high' as const, edgePoints: 40, timeEstimate: '4 hours' },
  ],
};

const mockPreparationData = {
  weeks: [
    {
      weekNumber: 1,
      dateRange: 'Jan 6 - Jan 12',
      focus: 'Essay Foundation',
      completionPercent: 100,
      tasks: [
        { id: 't1', title: 'Brainstorm essay topics', description: 'List 5 potential personal essay themes', category: 'Narrative', status: 'completed' as const, dueDate: 'Jan 8', estimatedTime: '1h' },
        { id: 't2', title: 'Research summer programs', description: 'Compare top 3 STEM summer programs', category: 'Planning', status: 'completed' as const, dueDate: 'Jan 10', estimatedTime: '2h' },
      ],
    },
    {
      weekNumber: 2,
      dateRange: 'Jan 13 - Jan 19',
      focus: 'Application Prep',
      completionPercent: 60,
      tasks: [
        { id: 't3', title: 'Request teacher recommendation', description: 'Ask physics teacher for rec letter', category: 'Application', status: 'completed' as const, dueDate: 'Jan 15', estimatedTime: '30m' },
        { id: 't4', title: 'Draft RSI essay', description: 'Write first draft of research interest essay', category: 'Application', status: 'in_progress' as const, dueDate: 'Jan 18', estimatedTime: '3h' },
        { id: 't5', title: 'Update activities list', description: 'Add recent achievements and hours', category: 'Application', status: 'pending' as const, dueDate: 'Jan 19', estimatedTime: '1h' },
      ],
    },
    {
      weekNumber: 3,
      dateRange: 'Jan 20 - Jan 26',
      focus: 'Leadership Development',
      completionPercent: 0,
      tasks: [
        { id: 't6', title: 'Plan robotics workshop curriculum', description: 'Design 4-week beginner robotics course', category: 'Leadership', status: 'pending' as const, dueDate: 'Jan 22', estimatedTime: '4h' },
        { id: 't7', title: 'Recruit workshop volunteers', description: 'Get 3 club members to help teach', category: 'Leadership', status: 'pending' as const, dueDate: 'Jan 25', estimatedTime: '1h' },
      ],
    },
  ],
  currentWeek: 2,
};

const mockGrowthData = {
  events: [
    { id: 'e1', date: 'Jan 15, 2025', title: 'USACO Silver Promotion', description: 'Advanced from Bronze to Silver division after consistent practice', category: 'achievement' as const, impact: 'high' as const, scoreChange: 5 },
    { id: 'e2', date: 'Jan 10, 2025', title: 'Tutoring Program Expansion', description: 'Added 10 new students to weekly tutoring sessions', category: 'milestone' as const, impact: 'medium' as const, scoreChange: 3 },
    { id: 'e3', date: 'Jan 5, 2025', title: 'Essay Hook Discovery', description: 'Found unique angle connecting robotics to family heritage', category: 'insight' as const, impact: 'high' as const },
    { id: 'e4', date: 'Dec 20, 2024', title: 'Robotics Club President Election', description: 'Elected as president for the upcoming year', category: 'achievement' as const, impact: 'high' as const, scoreChange: 8 },
    { id: 'e5', date: 'Dec 15, 2024', title: 'Started Application Research', description: 'Began systematic research of target schools', category: 'action' as const, impact: 'medium' as const },
  ],
  totalGrowth: 16,
};

// Loading fallback
function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.bgPage }}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={40} className="animate-spin" style={{ color: COLORS.primary }} />
        <p className="text-sm" style={{ color: COLORS.textSecondary }}>Loading Dashboard...</p>
      </div>
    </div>
  );
}

// Main dashboard content
function DashboardContent() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const is_completed = useSessionStore((s) => s.is_completed);
  const studentProfile = useStudentStore((s) => s.profile);
  const [activeTab, setActiveTab] = useState<TabId>('assessment');
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [blinkingTabs, setBlinkingTabs] = useState<TabId[]>([]);
  const narrativeSynthesisAttempted = useRef(false);

  // v5.3: Listen for agent events to trigger execution tab notification
  useEventBus('GAMEPLAN_GENERATED', () => {
    // When game plan is generated, notify user about execution tab
    if (activeTab !== 'execution') {
      setBlinkingTabs((prev) => prev.includes('execution') ? prev : [...prev, 'execution']);
    }
  }, [activeTab]);

  useEventBus('EXECUTION_NUDGE', () => {
    // When execution nudge arrives, blink the execution tab
    if (activeTab !== 'execution') {
      setBlinkingTabs((prev) => prev.includes('execution') ? prev : [...prev, 'execution']);
    }
  }, [activeTab]);

  // === REAL HOOKS - Call /api/score and use real engines ===
  const {
    calculateScore,
    results,
    isLoading: isScoreLoading,
    error: scoreError,
  } = useScoring();

  const { totalScore, categoryScores, percentileRank, hasResults } = useIvyScore();
  const { probabilities: schoolProbabilities, topSchool } = useSchoolProbabilities();
  const { archetype, label: archetypeLabel, tagline } = useArchetype();
  const { helping: helpingFactors, holdingBack: holdingBackFactors } = useFactors();

  // =========================================================================
  // v5.2 DATA UNIFICATION: Get narrative from DB, fallback to store
  // =========================================================================

  // Get profile_id for DB queries - prefer auth user ID (profiles table is keyed by user ID)
  const storeProfileId = useSessionStore((s) => s.profile_id);
  const storeUserId = useSessionStore((s) => s.user_id);
  // Auth user ID is the most reliable source - matches profiles table primary key
  const profileId = user?.id || storeProfileId || storeUserId;

  // Primary source: Database via useProfileIdentity
  const { data: identityFromDB, isLoading: identityLoading } = useProfileIdentity(profileId);
  const invalidateProfileIdentity = useInvalidateProfileIdentity();

  // Fallback source: Local store (for backwards compatibility during migration)
  const storeBrandStatement = useResultsStore((s) => s.brand_statement);
  const storeNarrativeThemes = useResultsStore((s) => s.narrative_themes);
  const storeNarrativeDna = useResultsStore((s) => s.narrative_dna);
  const storeFirstPrinciple = useResultsStore((s) => s.first_principle);
  const setNarrative = useResultsStore((s) => s.setNarrative);

  // v5.2: Prefer DB data, fallback to store
  const brandStatement = identityFromDB?.brandStatement || storeBrandStatement;
  const narrativeThemes = (identityFromDB?.narrativeThemes?.length ?? 0) > 0
    ? identityFromDB?.narrativeThemes ?? []
    : storeNarrativeThemes;
  const narrativeDna = identityFromDB?.narrativeDna || storeNarrativeDna;
  const firstPrinciple = identityFromDB?.firstPrinciple || storeFirstPrinciple;

  // Game Plan and Insights from real engines
  const {
    gamePlan,
    generatePlan,
    phases,
    quickWins,
    isGenerating: isGamePlanGenerating,
  } = useGamePlan();
  const { weeklyTasks } = usePreparationData();
  const {
    insights,
    generateInsights,
    criticalInsights,
    warningInsights,
    positiveInsights,
    isGenerating: isInsightsGenerating,
  } = useInsights();

  // Load game plan from Supabase
  const { gamePlanData: supabaseGamePlan } = useUserData();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if assessment not complete
  useEffect(() => {
    if (mounted && !is_completed) {
      router.replace('/assessment');
    }
  }, [is_completed, router, mounted]);

  // === FETCH REAL DATA ON MOUNT ===
  // v5.2: Added race condition guard - only synthesize if not loading from DB
  useEffect(() => {
    const initializeDashboard = async () => {
      if (!mounted) return;

      // If incomplete, we should rely on the effect below to redirect, but let's not block init if we are here.
      if (!is_completed) {
        console.log('[Dashboard] Assessment not complete, waiting for redirect...');
        setIsInitialized(true);
        return;
      }

      try {
        // RECOVERY: Extract narrative from existing results if missing in store
        // This fixes the "Generating forever" issue by avoiding unnecessary API calls
        if (hasResults && results?.brand_statement && !brandStatement) {
          console.log('[Dashboard] Recovering narrative from existing results...');
          setNarrative({
            brand_statement: results.brand_statement,
            narrative_dna: results.narrative_dna || '',
            first_principle: results.archetype_label || '',
            themes: results.themes || [],
            synthesis_inputs: studentProfile as any,
            confidence: 0.9
          });
          return; // Wait for re-render with updated store
        }

        // Calculate scores if not already done, or if we have results but missing narrative data (legacy cache)
        if (!hasResults || (results && !results.brand_statement && !brandStatement)) {
          console.log('[Dashboard] Refreshing score to populate narrative...');
          await calculateScore();
          return; // Wait for store update and re-render
        }

        // v5.2: Generate narrative synthesis if not exists OR if stale
        // Race condition guard: Don't synthesize while DB is loading
        // Loop guard: Only attempt synthesis ONCE per page load

        const shouldSynthesize =
          !identityLoading &&                    // DB query complete
          !narrativeSynthesisAttempted.current && // Only attempt once per page load
          profileId &&                           // Have valid profile ID
          studentProfile &&                      // Have student profile
          is_completed &&                        // Assessment is complete
          !brandStatement;                       // No brand statement from DB or store

        if (shouldSynthesize) {
          narrativeSynthesisAttempted.current = true;
          console.log('[Dashboard] Generating narrative synthesis...');

          try {
            // Use profileId which prefers auth user ID (already defined above)
            // CRITICAL: Wrap studentProfile in { profile_data: ... } to match agent contract
            const narrativeResult = await agentV2Api.synthesizeNarrative({
              profile_id: profileId,
              profile: studentProfile as unknown as Record<string, unknown>,
              assessment_contract: { profile_data: studentProfile } as unknown as Record<string, unknown>,
            });
            if (narrativeResult.success) {
              console.log("Narrative Result:", narrativeResult);
              // Still set in store for backwards compatibility
              setNarrative({
                brand_statement: narrativeResult.brand_statement || 'Your aspirational story is being crafted.',
                narrative_dna: narrativeResult.narrative_dna || '',
                first_principle: narrativeResult.first_principle || '',
                themes: narrativeResult.themes || [],
                confidence: narrativeResult.confidence || 0.8,
              });
              console.log('[Dashboard] Narrative synthesized successfully');

              // Invalidate cache to fetch fresh narrative from DB
              if (profileId) {
                invalidateProfileIdentity(profileId);
              }
            }
          } catch (narrativeErr) {
            console.warn('[Dashboard] Narrative synthesis failed:', narrativeErr);
          }
        }

        // Generate game plan if not exists
        if (!gamePlan) {
          console.log('[Dashboard] Generating game plan...');
          await generatePlan();
        }

        // Generate insights if empty
        if (insights.length === 0) {
          console.log('[Dashboard] Generating insights...');
          await generateInsights();
        }

        setIsInitialized(true);
      } catch (err) {
        console.error('[Dashboard] Initialization error:', err);
        setIsInitialized(true); // Still show UI even on error
      }
    };

    initializeDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, is_completed, hasResults, gamePlan, insights.length, identityLoading]);

  const handleLogout = async () => {
    // Sign out from Supabase first
    await signOut();
    // Then clear local state with session manager
    logout({ redirectTo: '/', forceReload: true });
  };

  const handleRetakeAssessment = () => {
    // Use centralized session manager to start fresh
    startFreshAssessment({ redirectTo: '/assessment' });
  };

  const handleDeleteUserData = async () => {
    if (!user?.id) {
      console.warn('[Dashboard] No user ID, cannot delete data');
      return;
    }

    // Confirm with user before deleting
    const confirmed = window.confirm(
      'Are you sure you want to delete all your data? This will remove your assessment, game plan, and all progress. You will need to retake the assessment.'
    );

    if (!confirmed) return;

    try {
      console.log('[Dashboard] Deleting user data from Supabase...');
      const result = await deleteUserData(user.id);

      if (result.success) {
        console.log('[Dashboard] User data deleted:', result.deletedCounts);

        // Invalidate React Query cache to clear old brand statement and narrative data
        if (profileId) {
          invalidateProfileIdentity(profileId);
          console.log('[Dashboard] React Query cache invalidated for profile:', profileId);
        }

        // Sign out from Supabase Auth to force fresh login
        console.log('[Dashboard] Signing out to clear auth state...');
        await signOut();

        // Clear local stores and redirect to home (logout handles this)
        logout({ redirectTo: '/', forceReload: true });
      } else {
        console.error('[Dashboard] Failed to delete user data:', result.error);
        alert('Failed to delete data. Please try again.');
      }
    } catch (err) {
      console.error('[Dashboard] Delete error:', err);
      alert('An error occurred while deleting data.');
    }
  };

  // === BUILD ASSESSMENT DATA FROM REAL SCORES ===
  const assessmentData = useMemo(() => {
    // Use real scores from /api/score via hooks
    // Apply Math.round() to avoid floating point display issues (e.g., 61.85000000000001%)
    const aptitudeScore = Math.round(categoryScores.aptitude);
    const passionScore = Math.round(categoryScores.passion);
    const serviceScore = Math.round(categoryScores.community);
    const identityScore = Math.round(categoryScores.narrative);
    const overallScore = Math.round(totalScore);
    const tier = getTierFromScore(overallScore);

    // Defensive: Ensure factors are strings (filter out any non-string values)
    const safeHelpingFactors = Array.isArray(helpingFactors)
      ? helpingFactors.filter((f) => typeof f === 'string')
      : [];

    const safeHoldingBackFactors = Array.isArray(holdingBackFactors)
      ? holdingBackFactors.filter((f) => typeof f === 'string')
      : [];

    // Generate strengths from real helping factors
    const strengths = safeHelpingFactors.length > 0
      ? safeHelpingFactors.slice(0, 3).map((factor, i) => ({
        title: factor,
        roi: 3.5 - i * 0.5,
        impact: i === 0 ? 'High admission boost' : i === 1 ? 'Strong differentiation' : 'Solid foundation',
      }))
      : [
        aptitudeScore >= 70 && { title: 'Strong Academic Foundation', roi: 3.5, impact: 'High admission boost' },
        passionScore >= 60 && { title: 'Demonstrated Passion & Leadership', roi: 3.0, impact: 'Strong differentiation' },
        serviceScore >= 50 && { title: 'Community Service Commitment', roi: 2.5, impact: 'Service differentiation' },
      ].filter(Boolean) as Array<{ title: string; roi: number; impact: string }>;

    // Generate weak spots from real holding back factors
    // Priority thresholds aligned with Frame 6: P0 (<40%), P1 (40-60%), P2 (60-75%)
    const getPriority = (score: number): 'P0' | 'P1' | 'P2' => {
      if (score < 40) return 'P0';
      if (score < 60) return 'P1';
      return 'P2';
    };

    const weakSpots = safeHoldingBackFactors.length > 0
      ? safeHoldingBackFactors.slice(0, 3).map((factor, i) => ({
        title: factor,
        priority: (i === 0 ? 'P0' : i === 1 ? 'P1' : 'P2') as 'P0' | 'P1' | 'P2',
        description: `Address this to improve your overall profile`,
      }))
      : [
        aptitudeScore < 75 && { title: 'Academic Profile Needs Development', priority: getPriority(aptitudeScore), description: 'Focus on GPA and test scores' },
        passionScore < 75 && { title: 'Extracurricular Depth', priority: getPriority(passionScore), description: 'Develop sustained activity involvement' },
        serviceScore < 75 && { title: 'Community Impact', priority: getPriority(serviceScore), description: 'Increase service hours and leadership' },
        identityScore < 75 && { title: 'Personal Narrative', priority: getPriority(identityScore), description: 'Clarify your unique story and direction' },
      ].filter(Boolean) as Array<{ title: string; priority: 'P0' | 'P1' | 'P2'; description: string }>;

    // Get target schools from real probabilities
    const rawTargetSchools = schoolProbabilities.length > 0
      ? schoolProbabilities.slice(0, 4).map((s) => s.school_id)
      : studentProfile?.target_schools || ['Harvard', 'Stanford', 'MIT', 'Yale'];

    // Defensive: Ensure target schools are strings
    const targetSchools = Array.isArray(rawTargetSchools)
      ? rawTargetSchools.filter((school) => typeof school === 'string')
      : ['Harvard', 'Stanford', 'MIT', 'Yale'];

    // Calculate admissions probability from real data
    const avgProbability = schoolProbabilities.length > 0
      ? Math.round(schoolProbabilities.reduce((sum, s) => sum + (s.p_final || 0) * 100, 0) / schoolProbabilities.length)
      : Math.round(overallScore * 0.35);

    return {
      ivyReadyScore: {
        overall: overallScore,
        tier,
        changeVs180Days: 0,
      },
      pillars: {
        aptitude: aptitudeScore,
        passion: passionScore,
        service: serviceScore,
        identity: identityScore,
      },
      dimensionalScores: [
        { dimension: 'Academic Rigor', score: aptitudeScore, tier: aptitudeScore >= 85 ? 'Excellent' : aptitudeScore >= 70 ? 'Strong' : aptitudeScore >= 50 ? 'Good' : 'Developing' },
        { dimension: 'Leadership', score: passionScore, tier: passionScore >= 85 ? 'Excellent' : passionScore >= 70 ? 'Strong' : passionScore >= 50 ? 'Good' : 'Developing' },
        { dimension: 'Community Impact', score: serviceScore, tier: serviceScore >= 85 ? 'Excellent' : serviceScore >= 70 ? 'Strong' : serviceScore >= 50 ? 'Good' : 'Developing' },
        { dimension: 'Personal Story', score: identityScore, tier: identityScore >= 85 ? 'Excellent' : identityScore >= 70 ? 'Strong' : identityScore >= 50 ? 'Good' : 'Developing' },
      ],
      strengths: strengths.length > 0 ? strengths : [{ title: 'Building Your Foundation', roi: 2.0, impact: 'Starting fresh with potential' }],
      weakSpots: weakSpots.length > 0 ? weakSpots : [{ title: 'Strong Foundation — Focus on Polish', priority: 'P2' as const, description: 'Your profile is well-rounded. Focus on differentiation and narrative clarity.' }],
      admissionsRubric: {
        academicIndex: aptitudeScore,
        extracurricularRating: passionScore,
        personalQualities: identityScore,
        recommendationStrength: Math.round((aptitudeScore + passionScore) / 2),
        overallAdmitProbability: avgProbability,
        targetSchools,
      },
      criMultiplier: studentProfile?.demographics?.first_gen ? 1.3 : 1.0,
      // Narrative synthesis data from agents
      brandStatement: brandStatement || null,
      narrativeThemes: Array.isArray(narrativeThemes) ? narrativeThemes.filter((t): t is string => typeof t === 'string') : [],
      narrativeDna: narrativeDna || null,
      firstPrinciple: firstPrinciple || null,
    };
  }, [totalScore, categoryScores, helpingFactors, holdingBackFactors, schoolProbabilities, studentProfile, brandStatement, narrativeThemes, narrativeDna, firstPrinciple]);

  // === BUILD GAME PLAN DATA FROM SUPABASE + REAL ENGINE ===
  const realGamePlanData = useMemo(() => {
    // Get tier info from Supabase game plan or generated plan
    const tierInfo = supabaseGamePlan?.planData?.tierInfo as { title?: string; description?: string; encouragement?: string } | undefined;
    const storedPhases = supabaseGamePlan?.planData?.phases as Array<{ name: string; duration: string; goals: string[]; actions: string[] }> | undefined;
    const storedQuickWins = supabaseGamePlan?.planData?.quickWins as Array<{ id: string; title: string; description?: string; category: string; priority: string; timeCommitment: string }> | undefined;
    const storedSummary = supabaseGamePlan?.planData?.fullSummary as { strengthAreas?: string[]; improvementAreas?: string[]; focusRecommendation?: string } | undefined;

    // Build target profile from real data
    const targetTier = supabaseGamePlan?.targetTier || gamePlan?.tier || 'optimization';
    const tierTitles: Record<string, string> = {
      'fresh-start': 'Foundation Builder',
      'emerging': 'Rising Achiever',
      'optimization': 'Elite Optimizer',
    };
    const tierDescriptions: Record<string, string> = {
      'fresh-start': 'Building a strong foundation for college admissions success.',
      'emerging': 'Developing key strengths and expanding your profile.',
      'optimization': 'Fine-tuning an already strong profile for maximum impact.',
    };

    // Get real target schools from student profile
    const realTargetSchools = studentProfile?.target_schools || [];
    const targetSchoolsFormatted = realTargetSchools.length > 0
      ? realTargetSchools.map((school, idx) => ({
        name: school,
        tier: idx < 2 ? 'Reach' as const : idx < 3 ? 'Target' as const : 'Safety' as const,
      }))
      : mockGamePlanData.targetSchools;

    // Build target profile
    const targetProfile = {
      name: tierInfo?.title || tierTitles[targetTier] || 'Personalized Strategy',
      narrative: tierInfo?.description || tierDescriptions[targetTier] || 'Your customized roadmap to college admissions success.',
    };

    // Build phases from Supabase data or generated plan
    const realPhases = storedPhases && storedPhases.length > 0
      ? storedPhases.map((phase, idx) => ({
        id: `phase${idx + 1}`,
        name: phase.name,
        dateRange: phase.duration,
        goal: phase.goals?.[0] || '',
        completionPercent: supabaseGamePlan?.completionPercentage || (idx === 0 ? 50 : 0),
        milestones: (phase.actions || []).slice(0, 3).map((action, actionIdx) => ({
          id: `m${idx}-${actionIdx}`,
          title: action,
          status: 'pending' as const,
          targetDate: '',
        })),
      }))
      : phases.length > 0
        ? phases.map((phase, idx) => ({
          id: phase.id,
          name: phase.title,
          dateRange: phase.timeframe,
          goal: phase.description,
          completionPercent: idx === 0 ? 50 : 0,
          milestones: (phase.actions || []).slice(0, 3).map((action) => ({
            id: action.id,
            title: action.title,
            status: 'pending' as const,
            targetDate: action.deadline || '',
          })),
        }))
        : mockGamePlanData.phases;

    // Build actions from Supabase data or generated plan
    const realActions = storedQuickWins && storedQuickWins.length > 0
      ? storedQuickWins.slice(0, 5).map((action) => ({
        id: action.id,
        title: action.title,
        description: action.description || '',
        category: action.category,
        priority: action.priority as 'critical' | 'high' | 'medium',
        edgePoints: 30,
        timeEstimate: action.timeCommitment,
      }))
      : quickWins.length > 0
        ? quickWins.slice(0, 5).map((action) => ({
          id: action.id,
          title: action.title,
          description: action.description || '',
          category: action.category,
          priority: action.priority as 'critical' | 'high' | 'medium',
          edgePoints: 30,
          timeEstimate: action.timeCommitment,
        }))
        : mockGamePlanData.actions;

    return {
      targetProfile,
      ecStrategy: mockGamePlanData.ecStrategy, // Keep mock for now - EC strategy is complex
      targetSchools: targetSchoolsFormatted,
      awards: mockGamePlanData.awards, // Keep mock for now
      summerPrograms: mockGamePlanData.summerPrograms, // Keep mock for now
      phases: realPhases,
      currentPhase: supabaseGamePlan?.currentPhase || phases[0]?.id || 'phase1',
      actions: realActions,
      strategicInsights: gamePlan?.strategic_insights || [],
    };
  }, [gamePlan, phases, quickWins, supabaseGamePlan, studentProfile]);

  // === BUILD PREPARATION DATA FROM REAL ENGINE ===
  const realPreparationData = useMemo(() => {
    if (weeklyTasks.length === 0) return mockPreparationData;

    return {
      weeks: weeklyTasks.slice(0, 4).map((week) => ({
        weekNumber: week.weekNumber,
        dateRange: week.weekRange,
        focus: week.focus,
        completionPercent: week.progress,
        tasks: (week.tasks || []).map((task) => ({
          id: task.id,
          title: task.title,
          description: '',
          category: task.category,
          status: task.status,
          dueDate: '',
          estimatedTime: task.timeCommitment,
        })),
      })),
      currentWeek: 1,
    };
  }, [weeklyTasks]);

  // === BUILD GROWTH DATA FROM REAL INSIGHTS ===
  const realGrowthData = useMemo(() => {
    const events = [
      {
        id: 'assessment-complete',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        title: 'Assessment Completed',
        description: `Ivy+ Ready Score: ${Math.round(totalScore)}%`,
        category: 'milestone' as const,
        impact: 'high' as const,
        scoreChange: Math.round(totalScore),
      },
      ...criticalInsights.slice(0, 2).map((insight) => ({
        id: insight.id,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        title: insight.title,
        description: insight.message,
        category: 'insight' as const,
        impact: 'high' as const,
      })),
      ...positiveInsights.slice(0, 2).map((insight) => ({
        id: insight.id,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        title: insight.title,
        description: insight.message,
        category: 'achievement' as const,
        impact: 'medium' as const,
        scoreChange: 3,
      })),
    ];

    return {
      events: events.length > 0 ? events : mockGrowthData.events,
      totalGrowth: totalScore > 0 ? Math.round(totalScore) : mockGrowthData.totalGrowth,
    };
  }, [totalScore, criticalInsights, positiveInsights]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'assessment':
        return <AssessmentTab data={assessmentData} />;
      case 'gameplan':
        return <GamePlanTab data={realGamePlanData} />;
      case 'preparation':
        return <PreparationTab weeks={realPreparationData.weeks} currentWeek={realPreparationData.currentWeek} />;
      case 'growth':
        return <GrowthTab events={realGrowthData.events} totalGrowth={realGrowthData.totalGrowth} />;
      case 'multiagents':
        return <MultiAgentTab profileId={profileId} />;
      case 'execution':
        return <ExecutionTab />;
      default:
        return <AssessmentTab data={assessmentData} />;
    }
  };

  // Show loading while initializing or fetching data
  const isLoading = isScoreLoading || isGamePlanGenerating || isInsightsGenerating;

  // Debug state
  useEffect(() => {
    if (mounted) {
      console.log('[Dashboard] State:', {
        is_completed,
        isInitialized,
        isLoading,
        isScoreLoading,
        activeTab
      });
    }
  }, [mounted, is_completed, isInitialized, isLoading, isScoreLoading, activeTab]);

  if (!mounted) {
    return <DashboardLoading />;
  }

  // Redirect if assessment not complete
  if (!is_completed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.bgPage }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin" style={{ color: COLORS.primary }} />
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>Redirecting to assessment...</p>
        </div>
      </div>
    );
  }

  // Show loading indicator while fetching real data
  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.bgPage }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin" style={{ color: COLORS.primary }} />
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>Loading your profile data...</p>
          <p className="text-xs" style={{ color: COLORS.textMuted }}>Calling scoring engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bgPage }}>
      {/* Tab Navigation Header */}
      <TabHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          // Clear blinking when user clicks on the tab
          setBlinkingTabs((prev) => prev.filter((t) => t !== tab));
        }}
        studentName={studentProfile?.identity?.name || 'Student'}
        onLogout={handleLogout}
        onRetakeAssessment={handleRetakeAssessment}
        onDeleteUserData={handleDeleteUserData}
        blinkingTabs={blinkingTabs}
      />

      {/* Error Banner */}
      {scoreError && (
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
            <AlertCircle size={20} style={{ color: '#DC2626' }} />
            <div>
              <p className="font-medium" style={{ color: '#DC2626' }}>Scoring Error</p>
              <p className="text-sm" style={{ color: '#7F1D1D' }}>{scoreError}</p>
            </div>
            <button
              onClick={() => calculateScore()}
              className="ml-auto px-3 py-1 text-sm rounded"
              style={{ backgroundColor: '#DC2626', color: 'white' }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator for background operations */}
      {isLoading && isInitialized && (
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Loader2 size={16} className="animate-spin" style={{ color: '#2563EB' }} />
            <p className="text-sm" style={{ color: '#1E40AF' }}>Refreshing data...</p>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// Page wrapper with Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
