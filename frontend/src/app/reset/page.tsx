'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { deleteUserData } from '@/lib/services/assessmentService';
import { logout } from '@/lib/session/sessionManager';

export default function ResetPage() {
  const { user, signOut } = useAuth();
  const [status, setStatus] = useState<'idle' | 'deleting' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    if (!user?.id) {
      setStatus('error');
      setMessage('No user logged in');
      return;
    }

    setStatus('deleting');
    setMessage('Deleting all user data...');

    try {
      // Delete all data from database
      const result = await deleteUserData(user.id);

      if (result.success) {
        setStatus('done');
        setMessage('Data deleted successfully. Signing out...');

        // Wait a moment, then sign out
        setTimeout(async () => {
          await signOut();
          logout({ redirectTo: '/', forceReload: true });
        }, 1500);
      } else {
        setStatus('error');
        setMessage(`Delete failed: ${result.error}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Reset Account</h1>

        {status === 'idle' && (
          <>
            <p className="text-gray-700 mb-6">
              This will permanently delete all your assessment data, game plans, and progress.
              This action cannot be undone.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> You will need to complete the assessment again from scratch.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete All Data
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {status === 'deleting' && (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'done' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 mb-4">{message}</p>
            <button
              onClick={() => setStatus('idle')}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
