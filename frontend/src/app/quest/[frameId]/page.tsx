'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '@/lib/store';
import { useUserData } from '@/lib/hooks/useUserData';
import { useAuth } from '@/lib/auth/AuthProvider';
import { navigationLogger } from '@/lib/trace';
import { FRAME_CONFIG } from '@/components/quest/QuestContainer';
import { AssessmentLayout } from '@/components/layout/AssessmentLayout';

// Frame Components
import Frame1Warmup from '@/components/frames/Frame1Warmup';
import Frame2Snapshot from '@/components/frames/Frame2Snapshot';
import Frame3Building from '@/components/frames/Frame3Building';
import { Frame4Context } from '@/components/frames/Frame4Context';
import { Frame6ProfileReveal } from '@/components/frames/Frame6ProfileReveal';
import { Frame5GamePlan } from '@/components/frames/Frame5GamePlan';

// ============================================
// Types
// ============================================

interface FramePageProps {
  params: { frameId: string };
}

// ============================================
// Frame Component Map
// ============================================

const FRAME_COMPONENTS: Record<number, React.ComponentType<{ onComplete: () => void }>> = {
  1: Frame1Warmup,
  2: Frame2Snapshot,
  3: Frame3Building,
  4: Frame4Context,
  5: Frame6ProfileReveal, // Profile overview before detailed game plan
  6: Frame5GamePlan,      // Detailed game plan (final frame before results)
};

// ============================================
// Placeholder Frame Component
// ============================================

function PlaceholderFrame({ frameId, onComplete }: { frameId: number; onComplete: () => void }) {
  const frameConfig = FRAME_CONFIG.find((f) => f.id === frameId);
  const IconComponent = frameConfig?.iconComponent;

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-quest max-w-md text-center"
      >
        <div className="text-6xl mb-4 flex justify-center">
          {IconComponent && <IconComponent size={48} />}
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
          Frame {frameId}: {frameConfig?.name}
        </h1>
        <p className="text-text-secondary mb-6">
          {frameConfig?.description}
        </p>
        <p className="text-sm text-text-muted mb-6">
          This frame is under construction. The full implementation will be available soon.
        </p>
        <button
          onClick={onComplete}
          className="px-6 py-3 rounded-xl bg-primary-blue text-white font-semibold hover:bg-primary-blue-hover transition-colors"
        >
          Continue to Next Frame
        </button>
      </motion.div>
    </div>
  );
}

// ============================================
// Frame Page Component
// ============================================

export default function FramePage() {
  const params = useParams();
  const router = useRouter();
  const { goToFrame, completeFrame, completeAssessment } = useSessionStore();
  const { saveUserData } = useUserData();
  const { isAuthenticated } = useAuth();

  const frameId = useMemo(() => {
    const id = parseInt(params.frameId as string, 10);
    return isNaN(id) ? null : id;
  }, [params.frameId]);

  // Validate frame ID
  if (!frameId || frameId < 1 || frameId > 6) {
    notFound();
  }

  // Get frame config
  const frameConfig = useMemo(
    () => FRAME_CONFIG.find((f) => f.id === frameId),
    [frameId]
  );

  // Set current frame on mount
  useEffect(() => {
    if (frameId) {
      goToFrame(frameId as 1 | 2 | 3 | 4 | 5 | 6);
      navigationLogger.logFrameNavigation({
        fromFrame: 0,
        toFrame: frameId,
        direction: 'forward',
        trigger: 'auto',
      });
    }
  }, [frameId, goToFrame]);

  // Handle frame completion
  const handleComplete = () => {
    completeFrame();

    if (frameId < 6) {
      // Navigate to next frame
      navigationLogger.logFrameNavigation({
        fromFrame: frameId,
        toFrame: frameId + 1,
        direction: 'forward',
        trigger: 'button',
      });
      router.push(`/quest/${frameId + 1}`);
    } else {
      // Assessment complete - mark as completed and go to dashboard
      completeAssessment();

      // Save to Supabase if authenticated
      if (isAuthenticated) {
        console.log('[Quest] Saving assessment to Supabase...');
        saveUserData().catch((err) => {
          console.error('[Quest] Failed to save to Supabase:', err);
        });
      }

      router.push('/dashboard');
    }
  };

  // Get the frame component
  const FrameComponent = FRAME_COMPONENTS[frameId];

  return (
    <AssessmentLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={frameId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {FrameComponent ? (
            <FrameComponent onComplete={handleComplete} />
          ) : (
            <PlaceholderFrame frameId={frameId} onComplete={handleComplete} />
          )}
        </motion.div>
      </AnimatePresence>
    </AssessmentLayout>
  );
}
