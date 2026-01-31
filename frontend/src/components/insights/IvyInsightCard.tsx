'use client';

/**
 * IvyInsightCard - Apple Fitness/Watch-style insight card
 *
 * Features:
 * - Glassmorphism with orange tint (IvyLevel brand)
 * - Lucide-react icons (not emojis)
 * - Progress rings (Apple Watch style)
 * - Edge badges with animations
 * - Outcome data cards with statistics
 */

import { motion } from 'framer-motion';
import { IVYLEVEL_DESIGN } from '@/lib/constants/ivylevelDesign';
import type { RealtimeInsight } from '@/lib/insights/realtimeInsights';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Info,
  Zap,
  TrendingUp,
  Award,
  Target,
  BookOpen,
  Users,
  Microscope,
  Heart,
} from 'lucide-react';

// Map category to icon
const CATEGORY_ICONS = {
  positive: CheckCircle2,
  warning: AlertTriangle,
  tip: Lightbulb,
  info: Info,
} as const;

// Map insight title keywords to specific icons
function getInsightIcon(title: string, category: RealtimeInsight['category']) {
  const titleLower = title.toLowerCase();

  if (titleLower.includes('gpa') || titleLower.includes('academic')) return BookOpen;
  if (titleLower.includes('sat') || titleLower.includes('act') || titleLower.includes('test')) return Target;
  if (titleLower.includes('leadership')) return Award;
  if (titleLower.includes('research') || titleLower.includes('publication')) return Microscope;
  if (titleLower.includes('service') || titleLower.includes('community')) return Heart;
  if (titleLower.includes('rigor') || titleLower.includes('ap') || titleLower.includes('course')) return TrendingUp;
  if (titleLower.includes('impact') || titleLower.includes('reach')) return Users;

  return CATEGORY_ICONS[category];
}

interface OutcomeDataItem {
  label: string;
  value: string;
  comparison?: string;
}

interface IvyInsightCardProps {
  insight: RealtimeInsight | null;
  percentile?: number;
  xpEarned?: number;
  outcomeData?: OutcomeDataItem[];
  className?: string;
}

export function IvyInsightCard({
  insight,
  percentile,
  xpEarned = 25,
  outcomeData,
  className = '',
}: IvyInsightCardProps) {
  if (!insight) return null;

  const categoryStyles = {
    positive: {
      colors: IVYLEVEL_DESIGN.colors.rings.service,
    },
    warning: {
      colors: {
        start: IVYLEVEL_DESIGN.colors.secondary.yellow,
        end: IVYLEVEL_DESIGN.colors.secondary.yellowGold,
      },
    },
    tip: {
      colors: IVYLEVEL_DESIGN.colors.rings.passion,
    },
    info: {
      colors: IVYLEVEL_DESIGN.colors.rings.identity,
    },
  };

  const style = categoryStyles[insight.category];
  const IconComponent = getInsightIcon(insight.title, insight.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 400,
        mass: 0.8,
      }}
      className={`relative overflow-hidden mt-4 ${className}`}
      style={{
        borderRadius: IVYLEVEL_DESIGN.radius.xl,
      }}
    >
      {/* Glassmorphism Background */}
      <div
        className="relative"
        style={{
          background: IVYLEVEL_DESIGN.glass.primary.background,
          backdropFilter: IVYLEVEL_DESIGN.glass.primary.backdropBlur,
          WebkitBackdropFilter: IVYLEVEL_DESIGN.glass.primary.backdropBlur,
          border: IVYLEVEL_DESIGN.glass.primary.border,
          boxShadow: IVYLEVEL_DESIGN.glass.primary.shadow,
          padding: IVYLEVEL_DESIGN.spacing[5],
        }}
      >
        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${style.colors.start}10, ${style.colors.end}05)`,
            opacity: 0.5,
            borderRadius: IVYLEVEL_DESIGN.radius.xl,
          }}
        />

        {/* Content */}
        <div className="relative z-10">

          {/* Header with Icon + Title */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Circular Icon Background */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.1,
                  type: 'spring',
                  damping: 15,
                }}
                className="relative flex-shrink-0"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${style.colors.start}, ${style.colors.end})`,
                    boxShadow: `0 4px 12px ${style.colors.start}40`,
                  }}
                >
                  <IconComponent className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>

                {/* Pulse animation for positive insights */}
                {insight.category === 'positive' && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${style.colors.start}, ${style.colors.end})`,
                    }}
                  />
                )}
              </motion.div>

              {/* Title */}
              <div className="min-w-0 flex-1">
                <h4
                  className="font-semibold truncate"
                  style={{
                    fontSize: IVYLEVEL_DESIGN.typography.fontSize.base,
                    lineHeight: '20px',
                    fontFamily: IVYLEVEL_DESIGN.typography.fontFamily.sans,
                    color: IVYLEVEL_DESIGN.colors.neutral.gray700,
                  }}
                >
                  {insight.title}
                </h4>
                {percentile && (
                  <p
                    className="mt-0.5"
                    style={{
                      fontSize: IVYLEVEL_DESIGN.typography.fontSize.xs,
                      fontFamily: IVYLEVEL_DESIGN.typography.fontFamily.sans,
                      color: IVYLEVEL_DESIGN.colors.neutral.gray500,
                    }}
                  >
                    Top {100 - percentile}% of applicants
                  </p>
                )}
              </div>
            </div>

            {/* Edge Badge */}
            {xpEarned && xpEarned > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 12 }}
                className="flex items-center gap-1 flex-shrink-0"
                style={{
                  padding: `${IVYLEVEL_DESIGN.spacing[1]} ${IVYLEVEL_DESIGN.spacing[2]}`,
                  borderRadius: IVYLEVEL_DESIGN.radius.full,
                  background: `linear-gradient(135deg, ${IVYLEVEL_DESIGN.colors.primary.main}, ${IVYLEVEL_DESIGN.colors.primary.light})`,
                  boxShadow: IVYLEVEL_DESIGN.shadows.orange,
                }}
              >
                <Zap className="w-3 h-3 text-white" fill="white" />
                <span
                  className="text-white font-semibold"
                  style={{
                    fontSize: IVYLEVEL_DESIGN.typography.fontSize.xs,
                    fontFamily: IVYLEVEL_DESIGN.typography.fontFamily.mono,
                  }}
                >
                  +{xpEarned}
                </span>
              </motion.div>
            )}
          </div>

          {/* Progress Ring (if percentile provided) */}
          {percentile && percentile > 0 && (
            <div className="mb-3 flex justify-center">
              <IvyProgressRing
                percentage={percentile}
                color={style.colors}
                size={64}
              />
            </div>
          )}

          {/* Message */}
          <p
            className="leading-relaxed"
            style={{
              fontSize: IVYLEVEL_DESIGN.typography.fontSize.sm,
              fontFamily: IVYLEVEL_DESIGN.typography.fontFamily.sans,
              color: IVYLEVEL_DESIGN.colors.neutral.gray600,
              lineHeight: IVYLEVEL_DESIGN.typography.lineHeight.relaxed,
            }}
          >
            {insight.message}
          </p>

          {/* Outcome Data Cards */}
          {outcomeData && outcomeData.length > 0 && (
            <div className="mt-4 space-y-2">
              <p
                className="text-xs font-medium uppercase tracking-wide mb-2 flex items-center gap-1"
                style={{
                  fontFamily: IVYLEVEL_DESIGN.typography.fontFamily.sans,
                  color: IVYLEVEL_DESIGN.colors.neutral.gray500,
                }}
              >
                <TrendingUp className="w-3 h-3" />
                Expected Outcomes
              </p>

              {outcomeData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                  className="flex items-center justify-between"
                  style={{
                    padding: IVYLEVEL_DESIGN.spacing[2],
                    borderRadius: IVYLEVEL_DESIGN.radius.sm,
                    background: IVYLEVEL_DESIGN.glass.subtle.background,
                    border: IVYLEVEL_DESIGN.glass.subtle.border,
                  }}
                >
                  <span
                    style={{
                      fontFamily: IVYLEVEL_DESIGN.typography.fontFamily.sans,
                      fontSize: IVYLEVEL_DESIGN.typography.fontSize.xs,
                      color: IVYLEVEL_DESIGN.colors.neutral.gray600,
                    }}
                  >
                    {item.label}
                  </span>
                  <div className="text-right">
                    <span
                      className="font-semibold"
                      style={{
                        fontSize: IVYLEVEL_DESIGN.typography.fontSize.sm,
                        fontFamily: IVYLEVEL_DESIGN.typography.fontFamily.mono,
                        color: IVYLEVEL_DESIGN.colors.neutral.gray700,
                      }}
                    >
                      {item.value}
                    </span>
                    {item.comparison && (
                      <p
                        className="mt-0.5"
                        style={{
                          fontSize: IVYLEVEL_DESIGN.typography.fontSize.xs,
                          fontFamily: IVYLEVEL_DESIGN.typography.fontFamily.sans,
                          color: IVYLEVEL_DESIGN.colors.neutral.gray400,
                        }}
                      >
                        {item.comparison}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Progress Ring Component
function IvyProgressRing({
  percentage,
  color,
  size = 64,
}: {
  percentage: number;
  color: { start: string; end: string };
  size?: number;
}) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const gradientId = `gradient-${percentage}-${Date.now()}`;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={IVYLEVEL_DESIGN.colors.neutral.gray200}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 1.2,
            ease: [0, 0, 0.2, 1],
          }}
          style={{
            strokeDasharray: circumference,
          }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.start} />
            <stop offset="100%" stopColor={color.end} />
          </linearGradient>
        </defs>
      </svg>

      {/* Percentage text */}
      <div className="absolute">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="font-bold"
          style={{
            fontSize: `${size / 4}px`,
            fontFamily: IVYLEVEL_DESIGN.typography.fontFamily.mono,
            color: IVYLEVEL_DESIGN.colors.neutral.gray700,
          }}
        >
          {Math.round(percentage)}%
        </motion.span>
      </div>
    </div>
  );
}

// Compact version for inline use (replaces CompactInsightCard)
export function IvyCompactInsightCard({
  insight,
  className = '',
}: {
  insight: RealtimeInsight | null;
  className?: string;
}) {
  if (!insight) return null;

  const categoryStyles = {
    positive: IVYLEVEL_DESIGN.colors.rings.service,
    warning: { start: IVYLEVEL_DESIGN.colors.secondary.yellow, end: IVYLEVEL_DESIGN.colors.secondary.yellowGold },
    tip: IVYLEVEL_DESIGN.colors.rings.passion,
    info: IVYLEVEL_DESIGN.colors.rings.identity,
  };

  const colors = categoryStyles[insight.category];
  const IconComponent = getInsightIcon(insight.title, insight.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.95 }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 350,
        mass: 0.6,
      }}
      className={`overflow-hidden ${className}`}
      style={{
        borderRadius: IVYLEVEL_DESIGN.radius.lg,
      }}
    >
      <div
        className="flex items-start gap-3"
        style={{
          background: IVYLEVEL_DESIGN.glass.neutral.background,
          backdropFilter: IVYLEVEL_DESIGN.glass.neutral.backdropBlur,
          WebkitBackdropFilter: IVYLEVEL_DESIGN.glass.neutral.backdropBlur,
          border: IVYLEVEL_DESIGN.glass.neutral.border,
          boxShadow: IVYLEVEL_DESIGN.glass.neutral.shadow,
          padding: IVYLEVEL_DESIGN.spacing[4],
        }}
      >
        {/* Icon */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors.start}, ${colors.end})`,
          }}
        >
          <IconComponent className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className="font-semibold text-sm mb-0.5"
            style={{ color: IVYLEVEL_DESIGN.colors.neutral.gray700 }}
          >
            {insight.title}
          </h4>
          <p
            className="text-xs leading-relaxed"
            style={{ color: IVYLEVEL_DESIGN.colors.neutral.gray600 }}
          >
            {insight.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default IvyInsightCard;
