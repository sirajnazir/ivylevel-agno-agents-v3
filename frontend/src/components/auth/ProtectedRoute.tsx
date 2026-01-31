/**
 * Protected Route & Role Guard
 * 
 * Components for protecting routes based on authentication and role.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, useUserRole, type UserRole } from '@/lib/auth/AuthProvider';
import { Loader2 } from 'lucide-react';

// =============================================================================
// LOADING SCREEN
// =============================================================================

function AuthLoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// =============================================================================
// PROTECTED ROUTE
// =============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  loadingMessage?: string;
}

/**
 * Wraps content that requires authentication.
 * Redirects to login if user is not authenticated.
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
  loadingMessage = 'Checking authentication...',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isReady, profile } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to be ready
    if (!isReady) return;

    if (requireAuth && !isAuthenticated) {
      // Not authenticated, redirect to login
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`${redirectTo}?returnUrl=${returnUrl}`);
    } else {
      setIsChecking(false);
    }
  }, [isReady, isAuthenticated, requireAuth, pathname, redirectTo, router]);

  // Show loading while checking
  if (!isReady || isChecking) {
    return <AuthLoadingScreen message={loadingMessage} />;
  }

  // Not authenticated and auth required
  if (requireAuth && !isAuthenticated) {
    return <AuthLoadingScreen message="Redirecting to login..." />;
  }

  return <>{children}</>;
}

// =============================================================================
// ROLE GUARD
// =============================================================================

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Restricts content to specific user roles.
 * Shows fallback or redirects if user doesn't have required role.
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  redirectTo,
}: RoleGuardProps) {
  const router = useRouter();
  const { profile, isReady, isAuthenticated } = useAuth();
  const userRole = useUserRole();

  useEffect(() => {
    // Wait for auth to be ready
    if (!isReady) return;

    // Must be authenticated
    if (!isAuthenticated) return;

    // Check if user has allowed role
    if (userRole && !allowedRoles.includes(userRole)) {
      if (redirectTo) {
        router.replace(redirectTo);
      }
    }
  }, [isReady, isAuthenticated, userRole, allowedRoles, redirectTo, router]);

  // Loading
  if (!isReady) {
    return <AuthLoadingScreen message="Verifying access..." />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return fallback || null;
  }

  // Check role
  if (!userRole || !allowedRoles.includes(userRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Default unauthorized message
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// =============================================================================
// CONVENIENCE GUARDS
// =============================================================================

interface ConvenienceGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Only allows students
 */
export function StudentOnly({ children, fallback }: ConvenienceGuardProps) {
  return (
    <RoleGuard allowedRoles={['student']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Only allows coaches
 */
export function CoachOnly({ children, fallback }: ConvenienceGuardProps) {
  return (
    <RoleGuard allowedRoles={['coach']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Only allows admins
 */
export function AdminOnly({ children, fallback }: ConvenienceGuardProps) {
  return (
    <RoleGuard allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Allows coaches and admins (staff)
 */
export function StaffOnly({ children, fallback }: ConvenienceGuardProps) {
  return (
    <RoleGuard allowedRoles={['coach', 'admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

// =============================================================================
// REDIRECT IF AUTHENTICATED
// =============================================================================

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

/**
 * Redirects authenticated users to their dashboard.
 * Useful for login/signup pages.
 */
export function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const router = useRouter();
  const { isAuthenticated, isReady, profile } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    if (isAuthenticated && profile) {
      // Redirect to appropriate dashboard
      const dashboardPath = getDashboardPath(profile.role);
      router.replace(dashboardPath);
    } else {
      setShouldRender(true);
    }
  }, [isReady, isAuthenticated, profile, router]);

  if (!isReady || !shouldRender) {
    return <AuthLoadingScreen message="Checking session..." />;
  }

  return <>{children}</>;
}

// =============================================================================
// HELPERS
// =============================================================================

function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'student':
      return '/dashboard';
    case 'coach':
      return '/coach';
    case 'admin':
      return '/admin';
    default:
      return '/dashboard';
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  AuthLoadingScreen,
  getDashboardPath,
};
