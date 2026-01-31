/**
 * NotificationPanel Component
 * v13.3 - Dropdown panel showing notification list
 *
 * Features:
 * - List of notifications with icons by type
 * - Mark as read on click
 * - Mark all as read
 * - Relative time formatting
 * - Empty state
 */
'use client';

import { useRef, useEffect } from 'react';
import {
  X,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  Bell,
  Lightbulb,
  Target,
  Flame,
} from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useAgentData';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  priority?: string;
  source_agent?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onRefresh: () => void;
  profileId: string;
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onRefresh,
  profileId,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getNotificationIcon = (type: string, priority?: string) => {
    // Priority-based icons
    if (priority === 'urgent' || type === 'urgent') {
      return <Flame size={16} style={{ color: BRAND_COLORS.error }} />;
    }

    // Type-based icons
    switch (type) {
      case 'deadline_high':
        return <AlertTriangle size={16} style={{ color: BRAND_COLORS.error }} />;
      case 'deadline_medium':
        return <Clock size={16} style={{ color: BRAND_COLORS.warning }} />;
      case 'deadline_low':
        return <Clock size={16} style={{ color: BRAND_COLORS.textMuted }} />;
      case 'award_match':
      case 'opportunity_match':
        return <Award size={16} style={{ color: BRAND_COLORS.success }} />;
      case 'milestone_complete':
        return <CheckCircle size={16} style={{ color: BRAND_COLORS.success }} />;
      case 'agent_insight':
        return <Lightbulb size={16} style={{ color: BRAND_COLORS.primary }} />;
      case 'crisis_pending':
        return <Target size={16} style={{ color: BRAND_COLORS.warning }} />;
      case 'silence_nudge':
      case 'checkin_reminder':
        return <Bell size={16} style={{ color: BRAND_COLORS.info }} />;
      default:
        return <Bell size={16} style={{ color: BRAND_COLORS.textMuted }} />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markRead({ profileId, notificationId: notification.id });
    }
  };

  const handleMarkAllRead = () => {
    markAllRead(profileId);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-lg z-50"
      style={{
        backgroundColor: '#ffffff',
        border: `1px solid ${BRAND_COLORS.borderLight}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b"
        style={{ borderColor: BRAND_COLORS.borderLight }}
      >
        <div className="flex items-center gap-2">
          <h3 style={{ color: BRAND_COLORS.textHeading }} className="font-semibold">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: BRAND_COLORS.primaryBg,
                color: BRAND_COLORS.primary,
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="text-xs hover:underline"
              style={{ color: BRAND_COLORS.primary }}
            >
              {isMarkingAll ? 'Marking...' : 'Mark all read'}
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={16} style={{ color: BRAND_COLORS.textMuted }} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell size={32} style={{ color: BRAND_COLORS.textMuted }} className="mx-auto mb-2" />
            <p style={{ color: BRAND_COLORS.textMuted }} className="text-sm">
              No notifications yet
            </p>
            <p style={{ color: BRAND_COLORS.textMuted }} className="text-xs mt-1">
              We'll notify you about important updates
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className="p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors"
              style={{
                borderColor: BRAND_COLORS.borderLight,
                backgroundColor: notification.read ? 'transparent' : BRAND_COLORS.primaryBg,
              }}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type, notification.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="font-medium text-sm line-clamp-1"
                      style={{ color: BRAND_COLORS.textHeading }}
                    >
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                        style={{ backgroundColor: BRAND_COLORS.primary }}
                      />
                    )}
                  </div>
                  <p
                    className="text-sm mt-0.5 line-clamp-2"
                    style={{ color: BRAND_COLORS.textMuted }}
                  >
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                      {formatRelativeTime(notification.created_at)}
                    </p>
                    {notification.source_agent && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: BRAND_COLORS.bgSecondary,
                          color: BRAND_COLORS.textMuted,
                        }}
                      >
                        {notification.source_agent}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div
          className="p-2 border-t text-center"
          style={{ borderColor: BRAND_COLORS.borderLight }}
        >
          <button
            onClick={onRefresh}
            className="text-xs hover:underline"
            style={{ color: BRAND_COLORS.primary }}
          >
            Refresh notifications
          </button>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default NotificationPanel;
