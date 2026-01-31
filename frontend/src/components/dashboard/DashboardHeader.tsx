/**
 * DashboardHeader Component
 * Sticky header with logo, CRI badge, archetype, and user menu.
 * @version 10.0
 */

'use client';

import { useState } from 'react';
import { Trash2, Zap, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  cri?: number;
  criBoost?: number;
  archetype?: string;
  userName?: string;
}

export function DashboardHeader({
  cri = 1.0,
  criBoost = 0,
  archetype,
  userName = 'Student'
}: DashboardHeaderProps) {

  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteData = async () => {
    if (!user?.id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to DELETE ALL DATA?\n\nThis will wipe your profile, assessment results, and game plan. This action cannot be undone."
    );

    if (confirmDelete) {
      try {
        // Call backend delete endpoint
        const response = await fetch(`/api/agents/profile?student_id=${user.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Sign out and redirect
          await signOut();
          router.push('/');
        } else {
          alert("Failed to delete data. Please try again.");
        }
      } catch (error) {
        console.error("Delete failed:", error);
        alert("An error occurred while deleting data.");
      }
    }
  };

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        backgroundColor: BRAND_COLORS.bgPrimary,
        borderColor: BRAND_COLORS.borderLight
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: BRAND_COLORS.primary }}
          >
            IQ
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Command Deck</h1>
            <p className="text-xs text-gray-500">Your mission control</p>
          </div>
        </div>

        {/* Center: Badges (Desktop only) */}
        <div className="hidden md:flex items-center gap-3">
          {/* CRI Badge */}
          {criBoost > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}
            >
              <Zap size={14} className="text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">
                +{criBoost}% CRI Boost
              </span>
            </div>
          )}

          {/* Archetype Badge */}
          {archetype && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#EDE9FE', border: '1px solid #C4B5FD' }}
            >
              <span className="text-sm font-medium text-purple-700">
                {archetype}
              </span>
            </div>
          )}
        </div>

        {/* Right: User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.bgPill }}
            >
              <User size={16} style={{ color: BRAND_COLORS.textMuted }} />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-700">
              {userName}
            </span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border z-50 py-1"
                style={{
                  backgroundColor: BRAND_COLORS.bgPrimary,
                  borderColor: BRAND_COLORS.borderLight
                }}
              >
                <button className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50">
                  <Settings size={16} className="text-gray-400" />
                  Settings
                </button>
                <button
                  onClick={handleDeleteData}
                  className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50 text-red-600 border-t border-gray-100"
                >
                  <Trash2 size={16} />
                  Delete User Data
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 text-red-600"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
