/**
 * TabHeader - Navigation Header with Tabs
 * v12.0 - Matches original frontend specification
 */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame, Search, Bell, LogOut, User, RefreshCw, ChevronDown,
  BarChart3, Map, Calendar, TrendingUp, Video, Bot, Trash2, Zap
} from 'lucide-react';
import { COLORS, TABS, type TabId } from '@/lib/constants/design';

const TAB_ICONS: Record<TabId, React.ReactNode> = {
  assessment: <BarChart3 size={16} />,
  gameplan: <Map size={16} />,
  preparation: <Calendar size={16} />,
  growth: <TrendingUp size={16} />,
  sessions: <Video size={16} />,
  multiagents: <Bot size={16} />,
  execution: <Zap size={16} />,
};

interface TabHeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  studentName?: string;
  onLogout?: () => void;
  onRetakeAssessment?: () => void;
  onDeleteUserData?: () => void;
  /** Tabs that should show blinking notification indicator */
  blinkingTabs?: TabId[];
}

export function TabHeader({ activeTab, onTabChange, studentName = 'Student', onLogout, onRetakeAssessment, onDeleteUserData, blinkingTabs = [] }: TabHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  // Check if a tab should blink
  const shouldBlink = (tabId: TabId) => blinkingTabs.includes(tabId) && activeTab !== tabId;

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b"
      style={{
        height: '64px',
        borderColor: COLORS.borderHeader,
      }}
    >
      <div className="h-full max-w-[1600px] mx-auto px-8 flex items-center justify-between">
        {/* Left: Logo + Tabs */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: COLORS.primary }}
            >
              <Flame size={18} className="text-white" />
            </div>
            <span className="font-semibold text-lg" style={{ color: COLORS.textHeading }}>
              IvyQuest
            </span>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1">
            {TABS.filter(t => t.enabled).map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  color: activeTab === tab.id ? COLORS.primary : COLORS.textSecondary,
                  backgroundColor: activeTab === tab.id ? COLORS.primaryLight : 'transparent',
                }}
                whileHover={{ backgroundColor: activeTab === tab.id ? COLORS.primaryLight : COLORS.bgSubtle }}
                whileTap={{ scale: 0.98 }}
              >
                {TAB_ICONS[tab.id]}
                {tab.label}
                {/* Blinking notification indicator */}
                {shouldBlink(tab.id) && (
                  <motion.span
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.primary }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: COLORS.primary }}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: COLORS.textMuted }}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full text-sm border focus:outline-none focus:ring-2"
              style={{
                borderColor: COLORS.borderDefault,
                width: '200px',
              }}
            />
          </div>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} style={{ color: COLORS.textSecondary }} />
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS.primary }}
            />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: COLORS.bgSubtle }}
              >
                <User size={16} style={{ color: COLORS.textSecondary }} />
              </div>
              <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                {studentName}
              </span>
              <ChevronDown size={14} style={{ color: COLORS.textMuted }} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border z-50 overflow-hidden"
                  style={{ backgroundColor: 'white', borderColor: COLORS.borderDefault }}
                >
                  {onRetakeAssessment && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onRetakeAssessment();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: COLORS.textPrimary }}
                    >
                      <RefreshCw size={16} style={{ color: COLORS.textSecondary }} />
                      Retake Assessment
                    </button>
                  )}
                  {onDeleteUserData && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDeleteUserData();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 transition-colors border-t"
                      style={{ color: '#dc2626', borderColor: COLORS.borderDefault }}
                    >
                      <Trash2 size={16} style={{ color: '#dc2626' }} />
                      Delete User Data
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-t"
                    style={{ color: COLORS.textPrimary, borderColor: COLORS.borderDefault }}
                  >
                    <LogOut size={16} style={{ color: COLORS.textSecondary }} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TabHeader;
