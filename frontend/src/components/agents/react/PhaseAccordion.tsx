/**
 * PhaseAccordion Component
 * ========================
 *
 * Expandable accordion wrapper for ReAct phases (THINK, ACT, OBSERVE, LEARN).
 * Similar to Claude AI's thinking accordion pattern.
 */
'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_COLORS } from '@/lib/constants/brand';
import type { PhaseType } from '@/lib/types/react-visualization';
import { PHASE_COLORS } from '@/lib/types/react-visualization';

interface PhaseAccordionProps {
  phase: PhaseType;
  icon: ReactNode;
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  badge?: string | number;
  duration?: number;
  isFirst?: boolean;
}

export function PhaseAccordion({
  phase,
  icon,
  title,
  children,
  defaultExpanded = false,
  badge,
  duration,
  isFirst = false,
}: PhaseAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const colors = PHASE_COLORS[phase];

  return (
    <div
      className={`rounded-lg overflow-hidden ${isFirst ? '' : 'mt-2'}`}
      style={{
        backgroundColor: expanded ? colors.bgColor : BRAND_COLORS.bgSecondary,
        border: `1px solid ${expanded ? colors.color + '40' : BRAND_COLORS.borderLight}`,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header - Clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:opacity-90 transition-opacity"
        style={{ backgroundColor: 'transparent' }}
      >
        <div className="flex items-center gap-3">
          {/* Phase Icon */}
          <span
            className="flex items-center justify-center w-7 h-7 rounded-full"
            style={{
              backgroundColor: colors.bgColor,
              color: colors.color,
            }}
          >
            {icon}
          </span>

          {/* Title */}
          <span
            className="font-semibold text-sm"
            style={{ color: expanded ? colors.color : BRAND_COLORS.textHeading }}
          >
            {title}
          </span>

          {/* Badge */}
          {badge !== undefined && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: colors.color,
                color: 'white',
              }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Right side: Duration + Chevron */}
        <div className="flex items-center gap-3">
          {duration !== undefined && (
            <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
              {duration}ms
            </span>
          )}
          <span style={{ color: BRAND_COLORS.textMuted }}>
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
        </div>
      </button>

      {/* Content - Expandable */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4"
              style={{
                borderTop: `1px solid ${colors.color}20`,
                marginTop: '-1px',
                paddingTop: '12px',
              }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PhaseAccordion;
