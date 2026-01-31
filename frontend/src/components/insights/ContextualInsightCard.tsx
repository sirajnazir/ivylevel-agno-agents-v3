'use client';

/**
 * ContextualInsightCard - Inline insight display after user inputs
 *
 * A compact, animated card that appears immediately after specific inputs
 * (GPA, SAT scores, leadership level, etc.) providing contextual feedback.
 * Designed to be embedded within form sections.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_COLORS } from '@/lib/constants/brand';
import type { RealtimeInsight } from '@/lib/insights/realtimeInsights';

// ============================================================================
// STYLING CONSTANTS
// ============================================================================

const CATEGORY_STYLES: Record<
  RealtimeInsight['category'],
  { bg: string; border: string; iconBg: string }
> = {
  positive: {
    bg: 'rgba(22, 163, 74, 0.06)',
    border: 'rgba(22, 163, 74, 0.2)',
    iconBg: 'rgba(22, 163, 74, 0.12)',
  },
  warning: {
    bg: 'rgba(217, 119, 6, 0.06)',
    border: 'rgba(217, 119, 6, 0.2)',
    iconBg: 'rgba(217, 119, 6, 0.12)',
  },
  tip: {
    bg: 'rgba(147, 51, 234, 0.06)',
    border: 'rgba(147, 51, 234, 0.2)',
    iconBg: 'rgba(147, 51, 234, 0.12)',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.06)',
    border: 'rgba(59, 130, 246, 0.2)',
    iconBg: 'rgba(59, 130, 246, 0.12)',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

interface ContextualInsightCardProps {
  /** The insight to display */
  insight: RealtimeInsight | null;
  /** Optional callback when user dismisses the card */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function ContextualInsightCard({
  insight,
  onDismiss,
  className = '',
}: ContextualInsightCardProps) {
  if (!insight) return null;

  const styles = CATEGORY_STYLES[insight.category];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={insight.id}
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`rounded-xl ${className}`}
        style={{
          backgroundColor: styles.bg,
          border: `1px solid ${styles.border}`,
          padding: '12px 14px',
        }}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: styles.iconBg }}
          >
            <span className="text-lg">{insight.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4
              className="font-semibold text-sm mb-0.5"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              {insight.title}
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: BRAND_COLORS.textPrimary }}
            >
              {insight.message}
            </p>
          </div>

          {/* Dismiss button (optional) */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
              style={{ color: BRAND_COLORS.textMuted }}
              aria-label="Dismiss insight"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

interface CompactInsightCardProps {
  /** The insight to display */
  insight: RealtimeInsight | null;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A more compact version for tighter UI spaces
 */
export function CompactInsightCard({
  insight,
  className = '',
}: CompactInsightCardProps) {
  if (!insight) return null;

  const styles = CATEGORY_STYLES[insight.category];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={insight.id}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className={`overflow-hidden ${className}`}
      >
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{
            backgroundColor: styles.bg,
            border: `1px solid ${styles.border}`,
          }}
        >
          <span className="text-base flex-shrink-0">{insight.icon}</span>
          <p
            className="text-xs leading-snug"
            style={{ color: BRAND_COLORS.textPrimary }}
          >
            <span
              className="font-semibold"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              {insight.title}:
            </span>{' '}
            {insight.message}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ContextualInsightCard;
