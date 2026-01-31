'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { logout } from '@/lib/session/sessionManager';

export default function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Sign out from Supabase
        await signOut();

        // Clear all local state
        logout({ redirectTo: '/', forceReload: true });
      } catch (error) {
        console.error('Logout error:', error);
        // Force logout anyway
        logout({ redirectTo: '/', forceReload: true });
      }
    };

    performLogout();
  }, [signOut]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Signing out...</p>
      </div>
    </div>
  );
}
