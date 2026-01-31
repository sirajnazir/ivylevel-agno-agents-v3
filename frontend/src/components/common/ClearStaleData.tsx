'use client';

import { useClearStaleData } from '@/lib/hooks/useClearStaleData';

/**
 * Client component that clears stale localStorage data on version changes.
 * Include this in the root layout to ensure data is cleared app-wide.
 *
 * This is a render-null component - it only runs the hook for its side effect.
 */
export function ClearStaleData(): null {
  useClearStaleData();
  return null;
}

export default ClearStaleData;
