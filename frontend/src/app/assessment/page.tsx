'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore, useStudentStore, useResultsStore, useUIStore } from '@/lib/store';
import { useScoring } from '@/lib/hooks/useScoring';
import { AssessmentLayout } from '@/components/layout/AssessmentLayout';
import { Frame1Warmup } from '@/components/frames/Frame1Warmup';
import { Frame2Snapshot } from '@/components/frames/Frame2Snapshot';
import { Frame3Building } from '@/components/frames/Frame3Building';
import { Frame4Operating } from '@/components/frames/Frame4Operating';
import { Frame5Reveal } from '@/components/frames/Frame5Reveal';
import { Frame6PowerUps } from '@/components/frames/Frame6PowerUps';
import { saveAssessmentToProfile } from '@/lib/services/profileService';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function AssessmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const currentFrame = useSessionStore((s) => s.current_frame);
  const nextFrame = useSessionStore((s) => s.nextFrame);
  const sessionId = useSessionStore((s) => s.session_id);
  const profile = useStudentStore((s) => s.profile);
  const results = useResultsStore((s) => s.results);
  const setResults = useResultsStore((s) => s.setResults);
  const setLoading = useUIStore((s) => s.setLoading);
  const addToast = useUIStore((s) => s.addToast);

  // Score calculation function
  const { calculateScore } = useScoring();

  // Frame completion handlers
  const handleFrame1Complete = useCallback(() => {
    nextFrame();
  }, [nextFrame]);

  const handleFrame2Complete = useCallback(() => {
    nextFrame();
  }, [nextFrame]);

  const handleFrame3Complete = useCallback(() => {
    nextFrame();
  }, [nextFrame]);

  const handleFrame4Complete = useCallback(async () => {
    // Calculate scores before showing reveal
    const results = await calculateScore();
    if (results) {
      nextFrame();
    }
  }, [nextFrame, calculateScore]);

  const handleFrame5Complete = useCallback(() => {
    nextFrame();
  }, [nextFrame]);

  const handleFrame6Complete = useCallback(async () => {
    // Save assessment to Supabase before navigating to dashboard
    if (user?.id) {
      setLoading(true, 'Saving your assessment...');
      try {
        // V2 MIGRATION: Use saveAssessmentToProfile
        // 1. Construct V2 Data
        // Map from store structure to V2 schema

        // Helper to format schools
        const targetSchools = {
          dream: [] as string[],
          reach: [] as string[],
          target: profile.target_schools || [],
          safety: [] as string[]
        };

        const v2Data = {
          firstName: profile.identity.name,
          grade: profile.identity.grade,
          // profile.identity doesn't have graduation_year in Types, try to calc or use any cast if needed
          graduationYear: (profile.identity as any).graduation_year || (new Date().getFullYear() + (12 - Number(profile.identity.grade || 11))),

          // School context (from high_school object)
          schoolName: profile.high_school?.hs_name,
          schoolType: profile.high_school?.hs_type,
          state: profile.high_school?.region,

          // Academic - cap GPA at 4.0 for database constraint
          gpa: (() => {
            const rawGpa = profile.aptitude?.gpa_weighted ?? profile.aptitude?.gpa_unweighted;
            return rawGpa !== undefined && rawGpa !== null && !isNaN(Number(rawGpa))
              ? Math.min(Number(rawGpa), 4.0)
              : undefined;
          })(),
          satScore: profile.aptitude?.sat_total,
          actScore: profile.aptitude?.act_total,

          // Portfolio
          targetSchools: targetSchools,
          // Map interests from assessment intelligence or operating
          interests: profile.operating?.careerInterest ? [{ area: profile.operating.careerInterest, level: 'curious' }] : [],
          values: [], // No direct source in store
          activities: [], // No array source in store, only aggregates

          // Computed Scores
          ivyScore: results?.ivy_ready_score?.total_score || 0,
          narrativeScore: results?.ivy_ready_score?.category_scores?.narrative || 0,

          // Identity Synthesis (Blocker 4 Fix)
          identitySynthesis: {
            archetype: results?.archetype_detected ? {
              id: results.archetype_detected.toLowerCase().replace(/\s+/g, '_'),
              name: results.archetype_detected,
              confidence: 0.8,
              description: results.narrative_tagline
            } : undefined,
            spike: profile.passion.spike_category,
            // Map category scores to PillarDetails roughly for Day 1
            pillars: {
              identity: { score: (results?.ivy_ready_score?.category_scores?.narrative || 0) / 10, evidence: [] },
              aptitude: { score: (results?.ivy_ready_score?.category_scores?.aptitude || 0) / 10, evidence: [] },
              passion: { score: (results?.ivy_ready_score?.category_scores?.passion || 0) / 10, evidence: [] },
              service: { score: (results?.ivy_ready_score?.category_scores?.community || 0) / 10, evidence: [] }
            }
          },

          assessmentComplete: true
        };

        // 2. Call New API
        const success = await saveAssessmentToProfile(user.id, v2Data);

        if (success) {
          console.log('[Assessment] V2 Profile saved successfully');

          addToast({
            type: 'success',
            title: 'Assessment Complete',
            message: 'Your profile has been saved!',
          });
        } else {
          console.error('[Assessment] V2 Save failed');
          addToast({
            type: 'error',
            title: 'Save Warning',
            message: 'Could not save to database, but you can continue.',
          });
        }
      } catch (error) {
        console.error('[Assessment] Save error:', error);
        addToast({
          type: 'error',
          title: 'Save Error',
          message: 'An error occurred while saving.',
        });
      } finally {
        setLoading(false);
      }
    }

    // Always navigate
    router.push('/dashboard');
  }, [router, user, sessionId, profile, results, setLoading, addToast]);

  return (
    <AssessmentLayout showPillarProgress={true}>
      {currentFrame === 1 && (
        <Frame1Warmup onComplete={handleFrame1Complete} />
      )}
      {currentFrame === 2 && (
        <Frame2Snapshot onComplete={handleFrame2Complete} />
      )}
      {currentFrame === 3 && (
        <Frame3Building onComplete={handleFrame3Complete} />
      )}
      {currentFrame === 4 && (
        <Frame4Operating onComplete={handleFrame4Complete} />
      )}
      {currentFrame === 5 && (
        <Frame5Reveal onComplete={handleFrame5Complete} />
      )}
      {currentFrame === 6 && (
        <Frame6PowerUps onComplete={handleFrame6Complete} />
      )}
    </AssessmentLayout>
  );
}
