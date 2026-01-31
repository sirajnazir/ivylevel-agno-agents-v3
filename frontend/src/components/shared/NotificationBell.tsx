/**
 * NotificationBell Component
 * v13.3 - Notification bell with unread count badge
 *
 * Displays a bell icon in the header with:
 * - Unread notification count badge
 * - Toggle to open NotificationPanel
 * - Real-time count updates via React Query
 */
'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { useNotificationCount, useNotifications } from '@/hooks/useAgentData';
import { NotificationPanel } from './NotificationPanel';

interface NotificationBellProps {
  profileId: string | null;
}

export function NotificationBell({ profileId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: countData, isLoading: countLoading } = useNotificationCount(profileId);
  const { data: notificationsData, refetch } = useNotifications(profileId);

  const unreadCount = countData?.unread_count || 0;

  // Don't render if no profileId
  if (!profileId) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell size={20} style={{ color: BRAND_COLORS.textPrimary }} />

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-medium rounded-full"
            style={{
              backgroundColor: BRAND_COLORS.error,
              color: '#ffffff',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Loading indicator */}
        {countLoading && (
          <span
            className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full animate-pulse"
            style={{ backgroundColor: BRAND_COLORS.textMuted }}
          />
        )}
      </button>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notificationsData?.notifications || []}
        onRefresh={() => refetch()}
        profileId={profileId}
      />
    </div>
  );
}

export default NotificationBell;
