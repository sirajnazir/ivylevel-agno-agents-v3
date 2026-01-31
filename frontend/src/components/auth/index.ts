/**
 * Auth Components - Barrel Export (Simplified Beta)
 *
 * For beta: Simple email/password login only.
 * No self-signup (admin creates accounts).
 */

// Auth Provider & Hooks - re-export from lib
export {
  AuthProvider,
  useAuth,
  useUser,
  useProfile,
  useIsAuthenticated,
  useUserRole,
  useAuthReady,
  USER_ROLES,
  type UserRole,
  type UserProfile,
} from '@/lib/auth/AuthProvider';

// Entry Portal
export { EntryPortal } from './EntryPortal';

// Login Page
export { LoginPage } from './LoginPage';

// Route Protection
export {
  ProtectedRoute,
  RoleGuard,
  StudentOnly,
  CoachOnly,
  AdminOnly,
  StaffOnly,
  RedirectIfAuthenticated,
  AuthLoadingScreen,
  getDashboardPath,
} from './ProtectedRoute';
