'use client';

/**
 * InsightsProvider - Initializes the insights auto-subscription
 *
 * Wrap your app with this provider to enable real-time insight generation
 * whenever the student profile changes.
 */

import { useEffect } from 'react';
import {
  initializeInsightSubscription,
  cleanupInsightSubscription,
  useInsightsStore,
} from '@/lib/store';

interface InsightsProviderProps {
  children: React.ReactNode;
  /** Generate insights immediately on mount (default: true) */
  generateOnMount?: boolean;
}

export function InsightsProvider({
  children,
  generateOnMount = true,
}: InsightsProviderProps) {
  useEffect(() => {
    // Initialize the auto-subscription to student profile changes
    initializeInsightSubscription();

    // Optionally generate insights immediately
    if (generateOnMount) {
      useInsightsStore.getState().generateInsights();
    }

    // Cleanup on unmount
    return () => {
      cleanupInsightSubscription();
    };
  }, [generateOnMount]);

  return <>{children}</>;
}

export default InsightsProvider;
