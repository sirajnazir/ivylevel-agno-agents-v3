'use client';

import { useAuth, useProfile } from '@/lib/auth/AuthProvider';
import { ProtectedRoute, AdminOnly } from '@/components/auth/ProtectedRoute';
import { Shield, Users, Settings, BarChart3, Mail, FileText, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const profile = useProfile();

  return (
    <ProtectedRoute>
      <AdminOnly>
        <div className="min-h-screen bg-gray-900">
          {/* Header */}
          <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-sm text-gray-400">
                    Welcome, {profile?.first_name || 'Admin'}
                  </p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <AdminCard
                icon={<Users className="w-6 h-6" />}
                label="User Management"
                description="Manage users, roles, and permissions"
              />
              <AdminCard
                icon={<BarChart3 className="w-6 h-6" />}
                label="Analytics"
                description="Platform usage and metrics"
              />
              <AdminCard
                icon={<Settings className="w-6 h-6" />}
                label="Settings"
                description="System configuration"
              />
              <AdminCard
                icon={<Mail className="w-6 h-6" />}
                label="Email Campaigns"
                description="Marketing and notifications"
              />
              <AdminCard
                icon={<FileText className="w-6 h-6" />}
                label="Audit Logs"
                description="Activity and security logs"
              />
              <AdminCard
                icon={<Shield className="w-6 h-6" />}
                label="Security"
                description="Access control and policies"
              />
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
              <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Admin Dashboard Coming Soon
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                This is a placeholder for the admin dashboard. Full functionality
                including user management, analytics, billing, and system settings
                will be available soon.
              </p>
            </div>
          </main>
        </div>
      </AdminOnly>
    </ProtectedRoute>
  );
}

function AdminCard({
  icon,
  label,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-amber-500/50 transition-colors cursor-pointer">
      <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4 text-amber-500">
        {icon}
      </div>
      <p className="font-semibold text-white mb-1">{label}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
