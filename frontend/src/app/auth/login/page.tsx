import { Suspense } from 'react';
import { LoginPage } from '@/components/auth/LoginPage';
import { RedirectIfAuthenticated } from '@/components/auth/ProtectedRoute';

export default function Login() {
  return (
    <RedirectIfAuthenticated>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600" /></div>}>
        <LoginPage />
      </Suspense>
    </RedirectIfAuthenticated>
  );
}
