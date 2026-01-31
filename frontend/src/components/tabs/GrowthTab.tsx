/**
 * GrowthTab - Timeline of Growth Transformations
 * v12.0 - Matches original frontend specification
 */
'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp, Calendar, Award, Star, Zap,
  ArrowRight, CheckCircle
} from 'lucide-react';
import { COLORS, GRADIENTS } from '@/lib/constants/design';

interface GrowthEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'milestone' | 'achievement' | 'insight' | 'action';
  impact: 'high' | 'medium' | 'low';
  scoreChange?: number;
}

interface GrowthTabProps {
  events: GrowthEvent[];
  totalGrowth?: number;
}

export function GrowthTab({ events, totalGrowth = 0 }: GrowthTabProps) {
  const categoryIcons = {
    milestone: Calendar,
    achievement: Award,
    insight: Star,
    action: Zap,
  };

  const categoryColors = {
    milestone: '#667eea',
    achievement: '#f59e0b',
    insight: '#8b5cf6',
    action: '#10b981',
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.textHeading }}>
              Growth Transformations
            </h1>
            <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
              Track your journey and celebrate progress
            </p>
          </div>
          {totalGrowth > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: GRADIENTS.purple }}
            >
              <TrendingUp size={20} className="text-white" />
              <span className="text-white font-bold text-xl">+{totalGrowth}%</span>
              <span className="text-white/75 text-sm">Total Growth</span>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div
          className="absolute left-8 top-0 bottom-0 w-0.5"
          style={{ backgroundColor: COLORS.borderDefault }}
        />

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const Icon = categoryIcons[event.category];
            const color = categoryColors[event.category];

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-20"
              >
                {/* Timeline Dot */}
                <div
                  className="absolute left-6 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <Icon size={12} className="text-white" />
                </div>

                {/* Date */}
                <span
                  className="absolute left-0 top-0 text-xs font-medium"
                  style={{ color: COLORS.textMuted }}
                >
                  {event.date}
                </span>

                {/* Event Card */}
                <div
                  className="bg-white rounded-xl p-4 border-l-4"
                  style={{
                    borderColor: color,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${color}15`,
                          color: color,
                        }}
                      >
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </span>
                      <h3
                        className="font-semibold mt-2"
                        style={{ color: COLORS.textHeading }}
                      >
                        {event.title}
                      </h3>
                      <p
                        className="text-sm mt-1"
                        style={{ color: COLORS.textSecondary }}
                      >
                        {event.description}
                      </p>
                    </div>
                    {event.scoreChange && (
                      <div
                        className="flex items-center gap-1 px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: event.scoreChange > 0 ? '#dcfce7' : '#fee2e2',
                          color: event.scoreChange > 0 ? COLORS.success : COLORS.error,
                        }}
                      >
                        <TrendingUp size={14} />
                        <span className="text-sm font-medium">
                          {event.scoreChange > 0 ? '+' : ''}{event.scoreChange}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {events.length === 0 && (
          <div className="text-center py-16">
            <TrendingUp size={48} style={{ color: COLORS.textMuted }} className="mx-auto mb-4" />
            <h3 className="font-semibold" style={{ color: COLORS.textHeading }}>
              Your growth journey begins here
            </h3>
            <p className="text-sm mt-2" style={{ color: COLORS.textSecondary }}>
              Complete actions and milestones to track your transformation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GrowthTab;
