'use client';

import { useAuth, useProfile } from '@/lib/auth/AuthProvider';
import { ProtectedRoute, StaffOnly } from '@/components/auth/ProtectedRoute';
import { Users, Calendar, BookOpen, BarChart3, LogOut } from 'lucide-react';

export default function CoachDashboard() {
  const { signOut } = useAuth();
  const profile = useProfile();

  return (
    <ProtectedRoute>
      <StaffOnly>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Coach Dashboard</h1>
                  <p className="text-sm text-gray-500">
                    Welcome, {profile?.first_name || 'Coach'}
                  </p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<Users className="w-6 h-6" />}
                label="Active Students"
                value="0"
                color="emerald"
              />
              <StatCard
                icon={<Calendar className="w-6 h-6" />}
                label="Sessions This Week"
                value="0"
                color="blue"
              />
              <StatCard
                icon={<BookOpen className="w-6 h-6" />}
                label="Resources Shared"
                value="0"
                color="purple"
              />
              <StatCard
                icon={<BarChart3 className="w-6 h-6" />}
                label="Avg. Student Score"
                value="--"
                color="amber"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Coach Dashboard Coming Soon
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                This is a placeholder for the coach dashboard. Full functionality
                including student management, session scheduling, and analytics
                will be available soon.
              </p>
            </div>
          </main>
        </div>
      </StaffOnly>
    </ProtectedRoute>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
