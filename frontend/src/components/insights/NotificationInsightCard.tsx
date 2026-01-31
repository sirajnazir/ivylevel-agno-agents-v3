'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IVYLEVEL_DESIGN } from '@/lib/constants/ivylevelDesign';
import { useNotificationStore } from '@/lib/hooks/useInsightNotifications';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Info,
  Zap,
  X,
  BookOpen,
  Target,
  Award,
  Microscope,
  Heart,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { RealtimeInsight } from '@/lib/insights/realtimeInsights';

// Get appropriate icon based on insight title keywords and category
function getNotificationIcon(title: string, category: RealtimeInsight['category']) {
  const titleLower = title.toLowerCase();

  if (titleLower.includes('gpa') || titleLower.includes('academic')) return BookOpen;
  if (titleLower.includes('sat') || titleLower.includes('act') || titleLower.includes('test')) return Target;
  if (titleLower.includes('leadership')) return Award;
  if (titleLower.includes('research') || titleLower.includes('publication')) return Microscope;
  if (titleLower.includes('service') || titleLower.includes('community')) return Heart;
  if (titleLower.includes('rigor') || titleLower.includes('ap') || titleLower.includes('course') || titleLower.includes('ib')) return TrendingUp;
  if (titleLower.includes('impact') || titleLower.includes('reach')) return Users;
  if (titleLower.includes('first-gen') || titleLower.includes('first gen') || titleLower.includes('pioneer')) return Zap;

  // Category fallbacks
  const categoryIcons = {
    positive: CheckCircle2,
    warning: AlertTriangle,
    tip: Lightbulb,
    info: Info,
  };
  return categoryIcons[category];
}

export function NotificationInsightCard() {
  const { current, isVisible, dismiss } = useNotificationStore();

  if (!current) return null;

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

  const style = categoryStyles[current.category];
  const IconComponent = getNotificationIcon(current.title, current.category);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -50 }}
          animate={{
            opacity: 1,
            scale: [0.5, 1.15, 1.0],
            y: 0,
          }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={IVYLEVEL_DESIGN.animation.easing.notificationBounce}
          className="fixed top-20 left-8 z-[9999] w-full max-w-xs"
        >
          {/* Glassmorphic Card */}
          <div
            className="relative overflow-hidden"
            style={{
              background: IVYLEVEL_DESIGN.glass.notification.background,
              backdropFilter: IVYLEVEL_DESIGN.glass.notification.backdropBlur,
              WebkitBackdropFilter: IVYLEVEL_DESIGN.glass.notification.backdropBlur,
              border: IVYLEVEL_DESIGN.glass.notification.border,
              boxShadow: `${IVYLEVEL_DESIGN.glass.notification.shadow}, ${IVYLEVEL_DESIGN.glass.notification.glow}`,
              borderRadius: IVYLEVEL_DESIGN.radius.xxl,
              padding: IVYLEVEL_DESIGN.spacing[4],
            }}
          >
            {/* Gradient Background Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${style.colors.start}15, ${style.colors.end}08)`,
                opacity: 0.6,
              }}
            />

            {/* Animated Glow Ring */}
            <motion.div
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-[24px]"
              style={{
                boxShadow: `0 0 30px ${style.colors.start}40`,
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  {/* Icon with pulse animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.2,
                      type: 'spring',
                      damping: 12,
                    }}
                    className="relative"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${style.colors.start}, ${style.colors.end})`,
                        boxShadow: `0 4px 16px ${style.colors.start}60`,
                      }}
                    >
                      <IconComponent className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Pulse ring for positive insights */}
                    {current.category === 'positive' && (
                      <motion.div
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${style.colors.start}, ${style.colors.end})`,
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Title */}
                  <h4
                    className="font-semibold flex-1"
                    style={{
                      fontSize: IVYLEVEL_DESIGN.typography.fontSize.lg,
                      fontFamily: IVYLEVEL_DESIGN.typography.fontFamily.sans,
                      color: IVYLEVEL_DESIGN.colors.neutral.gray700,
                    }}
                  >
                    {current.title}
                  </h4>
                </div>

                {/* Dismiss button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={dismiss}
                  className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/5 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>

              {/* Message */}
              <p
                className="leading-relaxed mb-3"
                style={{
                  fontSize: IVYLEVEL_DESIGN.typography.fontSize.base,
                  fontFamily: IVYLEVEL_DESIGN.typography.fontFamily.sans,
                  color: IVYLEVEL_DESIGN.colors.neutral.gray600,
                  lineHeight: IVYLEVEL_DESIGN.typography.lineHeight.relaxed,
                }}
              >
                {current.message}
              </p>

              {/* Edge Badge and Score Indicator Row */}
              <div className="flex items-center gap-2">
                {/* Edge Badge */}
                <motion.div
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ delay: 0.4, type: 'spring', damping: 12 }}
                  className="inline-flex items-center gap-1.5"
                  style={{
                    padding: `${IVYLEVEL_DESIGN.spacing[2]} ${IVYLEVEL_DESIGN.spacing[3]}`,
                    borderRadius: IVYLEVEL_DESIGN.radius.full,
                    background: `linear-gradient(135deg, ${IVYLEVEL_DESIGN.colors.primary.main}, ${IVYLEVEL_DESIGN.colors.primary.light})`,
                    boxShadow: IVYLEVEL_DESIGN.shadows.orange,
                  }}
                >
                  <Zap className="w-4 h-4 text-white" fill="white" />
                  <span
                    className="text-white font-semibold"
                    style={{
                      fontSize: IVYLEVEL_DESIGN.typography.fontSize.sm,
                      fontFamily: IVYLEVEL_DESIGN.typography.fontFamily.mono,
                    }}
                  >
                    +25 Edge
                  </span>
                </motion.div>

                {/* Score Increase Indicator (for positive insights only) */}
                {current.category === 'positive' && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-1"
                    style={{
                      color: IVYLEVEL_DESIGN.colors.rings.service.start,
                      fontSize: IVYLEVEL_DESIGN.typography.fontSize.sm,
                      fontWeight: IVYLEVEL_DESIGN.typography.fontWeight.bold,
                      fontFamily: IVYLEVEL_DESIGN.typography.fontFamily.mono,
                    }}
                  >
                    <motion.svg
                      className="w-4 h-4"
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 14l5-5 5 5H7z" />
                    </motion.svg>
                    <span>+6%</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NotificationInsightCard;
