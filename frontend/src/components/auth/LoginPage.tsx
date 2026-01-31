/**
 * Login Page
 * 
 * Role-aware login form with email/password authentication.
 * Redirects to appropriate dashboard based on user role.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Users, 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth, USER_ROLES, type UserRole } from '@/lib/auth/AuthProvider';

// =============================================================================
// LOGIN PAGE
// =============================================================================

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isLoading, isAuthenticated, profile, error: authError } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get role from URL
  const roleParam = searchParams.get('role') as UserRole | null;
  const role: UserRole = roleParam && roleParam in USER_ROLES ? roleParam : 'student';
  const roleConfig = USER_ROLES[role];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on profile role, or default to dashboard if no profile yet
      const redirectPath = profile ? getRedirectPath(profile.role) : '/dashboard';
      router.push(redirectPath);
    }
  }, [isAuthenticated, profile, router]);

  // Role icons
  const roleIcons: Record<UserRole, React.ReactNode> = {
    student: <GraduationCap className="w-6 h-6" />,
    coach: <Users className="w-6 h-6" />,
    admin: <Shield className="w-6 h-6" />,
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signIn(email, password);

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      // Success - redirect handled by useEffect
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-pink-200 rounded-full filter blur-3xl opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to portal
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Role badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ backgroundColor: `${roleConfig.color}15`, color: roleConfig.color }}
            >
              {roleIcons[role]}
              <span className="font-medium">{roleConfig.label} Login</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to continue to IvyQuest</p>
          </div>

          {/* Error display */}
          {(error || authError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error || authError}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Beta Notice */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              Beta Access Only
            </p>
            <p className="text-center text-xs text-gray-400 mt-1">
              Contact your administrator for account access
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getRedirectPath(role: UserRole): string {
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

export default LoginPage;
