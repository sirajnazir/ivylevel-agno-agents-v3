'use client';

import { useEffect } from 'react';
import { initializeTraceStore } from '@/lib/trace';
import { DebugOverlay } from '@/components/debug/DebugOverlay';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function QuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize trace logging
  useEffect(() => {
    initializeTraceStore();
  }, []);

  return (
    <ProtectedRoute
      requireAuth={true}
      redirectTo="/auth/login?role=student"
      loadingMessage="Loading assessment..."
    >
      <div className="relative min-h-screen">
        {/* Main Content */}
        {children}

        {/* Debug Overlay (development only) */}
        {process.env.NODE_ENV === 'development' && <DebugOverlay />}
      </div>
    </ProtectedRoute>
  );
}
