'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useUserData } from '@/lib/hooks/useUserData';

/**
 * Dashboard Data Loader
 * Automatically loads user data from Supabase when authenticated
 */
function DashboardDataLoader({ children }: { children: React.ReactNode }) {
  const { isLoading, syncStatus } = useUserData();

  // Show loading indicator while syncing from Supabase
  if (isLoading && syncStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F6] to-[#FFE5DF]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FF4A23] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Syncing your data...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      requireAuth={true}
      redirectTo="/auth/login?role=student"
      loadingMessage="Loading your dashboard..."
    >
      <DashboardDataLoader>
        {children}
      </DashboardDataLoader>
    </ProtectedRoute>
  );
}
