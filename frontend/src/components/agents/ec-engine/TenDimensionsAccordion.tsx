/**
 * TenDimensionsAccordion Component
 * =================================
 *
 * Displays the 10 Dimensions of Hyper-Personalization:
 * 1. Geographic - Where are they from?
 * 2. Identity WHY - What personal experience drives this?
 * 3. Field Gap - What gap in the field are they addressing?
 * 4. Catalyst - What specific moment sparked this journey?
 * 5. Target Audience - Who specifically are they helping?
 * 6. Unique Contribution - What can only THEY contribute?
 * 7. Representation - How do they represent underserved perspectives?
 * 8. Cultural Depth - How does heritage shape their approach?
 * 9. Temporal - Why is this the right time?
 * 10. Problem Specificity - How precisely is the problem defined?
 *
 * Expandable accordion with scores and evidence for each dimension.
 */
'use client';

import { useState } from 'react';
import {
  MapPin,
  User,
  Search,
  Lightbulb,
  Target,
  Star,
  Globe2,
  Palette,
  Clock,
  Crosshair,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_COLORS } from '@/lib/constants/brand';
import type { TenDimensionsData, DimensionData, DimensionType } from '@/lib/types/react-visualization';
import { DIMENSION_CONFIG, DIMENSION_PRIORITY_COLORS } from '@/lib/types/react-visualization';

interface TenDimensionsAccordionProps {
  data: TenDimensionsData;
  compact?: boolean;
  defaultExpanded?: DimensionType[];
}

// Dimension icons mapping (supports both uppercase and lowercase types)
const DIMENSION_ICONS: Record<string, React.ReactNode> = {
  GEOGRAPHIC: <MapPin size={18} />,
  geographic: <MapPin size={18} />,
  IDENTITY_WHY: <User size={18} />,
  identity_why: <User size={18} />,
  FIELD_GAP: <Search size={18} />,
  field_gap: <Search size={18} />,
  CATALYST: <Lightbulb size={18} />,
  catalyst: <Lightbulb size={18} />,
  TARGET_AUDIENCE: <Target size={18} />,
  target_audience: <Target size={18} />,
  UNIQUE_CONTRIBUTION: <Star size={18} />,
  unique_contribution: <Star size={18} />,
  unique: <Star size={18} />,
  REPRESENTATION: <Globe2 size={18} />,
  representation: <Globe2 size={18} />,
  CULTURAL_DEPTH: <Palette size={18} />,
  cultural_depth: <Palette size={18} />,
  TEMPORAL: <Clock size={18} />,
  temporal: <Clock size={18} />,
  PROBLEM_SPECIFICITY: <Crosshair size={18} />,
  problem_specificity: <Crosshair size={18} />,
  specificity: <Crosshair size={18} />,
};

// Helper to get dimension icon with fallback
const getDimensionIcon = (type: DimensionType): React.ReactNode => {
  return DIMENSION_ICONS[type] || DIMENSION_ICONS[type.toUpperCase()] || <Star size={18} />;
};

export function TenDimensionsAccordion({
  data,
  compact = false,
  defaultExpanded = [],
}: TenDimensionsAccordionProps) {
  const [expandedDimensions, setExpandedDimensions] = useState<Set<DimensionType>>(
    new Set(defaultExpanded)
  );

  const toggleDimension = (type: DimensionType) => {
    setExpandedDimensions((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedDimensions(
      new Set(data.dimensions.map((d) => d.type))
    );
  };

  const collapseAll = () => {
    setExpandedDimensions(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Header with Overall Score */}
      <div
        className="flex items-center justify-between p-4 rounded-xl"
        style={{
          backgroundColor: BRAND_COLORS.bgSecondary,
          border: `1px solid ${BRAND_COLORS.borderLight}`,
        }}
      >
        <div>
          <h3 className="text-sm font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
            10 Dimensions of Hyper-Personalization
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
              {data.dimensions_met} of {data.total_dimensions} dimensions met
            </span>
            <span
              className="text-sm font-bold"
              style={{
                color: data.hyper_personalization_score >= 80
                  ? BRAND_COLORS.success
                  : data.hyper_personalization_score >= 60
                  ? BRAND_COLORS.warning
                  : BRAND_COLORS.error,
              }}
            >
              {Math.round(data.hyper_personalization_score)}% personalized
            </span>
          </div>
        </div>

        {/* Expand/Collapse buttons */}
        {!compact && (
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: BRAND_COLORS.bgPrimary,
                border: `1px solid ${BRAND_COLORS.borderLight}`,
                color: BRAND_COLORS.textSecondary,
              }}
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: BRAND_COLORS.bgPrimary,
                border: `1px solid ${BRAND_COLORS.borderLight}`,
                color: BRAND_COLORS.textSecondary,
              }}
            >
              Collapse All
            </button>
          </div>
        )}
      </div>

      {/* Critical Gaps Alert */}
      {data.critical_gaps && data.critical_gaps.length > 0 && (
        <div
          className="p-3 rounded-lg flex items-start gap-3"
          style={{
            backgroundColor: BRAND_COLORS.bgError,
            border: `1px solid ${BRAND_COLORS.error}30`,
          }}
        >
          <AlertTriangle size={20} style={{ color: BRAND_COLORS.error }} className="flex-shrink-0" />
          <div>
            <p className="text-sm font-medium" style={{ color: BRAND_COLORS.error }}>
              Critical Gaps Identified
            </p>
            <ul className="mt-1 space-y-0.5">
              {data.critical_gaps.map((gap, idx) => (
                <li key={idx} className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Dimensions Progress Bar */}
      <div className="grid grid-cols-10 gap-1">
        {data.dimensions.map((dim) => {
          const isExpanded = expandedDimensions.has(dim.type);
          const score = dim.score || 0;
          return (
            <button
              key={dim.type}
              onClick={() => toggleDimension(dim.type)}
              className="h-2 rounded-full transition-all hover:scale-y-150"
              style={{
                backgroundColor: score >= 70
                  ? BRAND_COLORS.success
                  : score >= 40
                  ? BRAND_COLORS.warning
                  : BRAND_COLORS.error,
                opacity: isExpanded ? 1 : 0.5,
              }}
              title={`${DIMENSION_CONFIG[dim.type]?.label || dim.type}: ${Math.round(score)}%`}
            />
          );
        })}
      </div>

      {/* Dimensions List */}
      <div className="space-y-2">
        {data.dimensions.map((dimension) => (
          <DimensionAccordionItem
            key={dimension.type}
            dimension={dimension}
            isExpanded={expandedDimensions.has(dimension.type)}
            onToggle={() => toggleDimension(dimension.type)}
            compact={compact}
          />
        ))}
      </div>

      {/* Recommended Focus */}
      {data.recommended_focus && data.recommended_focus.length > 0 && (
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: BRAND_COLORS.primaryBg,
            border: `1px solid ${BRAND_COLORS.primary}30`,
          }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.primary }}>
            Recommended Focus Areas
          </p>
          <div className="flex flex-wrap gap-2">
            {data.recommended_focus.map((type) => (
              <button
                key={type}
                onClick={() => toggleDimension(type)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors hover:opacity-80"
                style={{
                  backgroundColor: BRAND_COLORS.primary,
                  color: 'white',
                }}
              >
                {DIMENSION_ICONS[type]}
                {DIMENSION_CONFIG[type]?.label || type}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual Dimension Accordion Item
interface DimensionAccordionItemProps {
  dimension: DimensionData;
  isExpanded: boolean;
  onToggle: () => void;
  compact?: boolean;
}

function DimensionAccordionItem({
  dimension,
  isExpanded,
  onToggle,
  compact,
}: DimensionAccordionItemProps) {
  const config = DIMENSION_CONFIG[dimension.type];
  const priorityColor = DIMENSION_PRIORITY_COLORS[dimension.priority] || BRAND_COLORS.textMuted;
  const score = dimension.score || 0;
  const passed = score >= 70;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        backgroundColor: BRAND_COLORS.bgPrimary,
        border: `1px solid ${isExpanded ? BRAND_COLORS.primary + '40' : BRAND_COLORS.borderLight}`,
      }}
    >
      {/* Header - Clickable */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <span
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              backgroundColor: `${priorityColor}15`,
              color: priorityColor,
            }}
          >
            {DIMENSION_ICONS[dimension.type]}
          </span>

          {/* Label and Description */}
          <div className="text-left">
            <span
              className="font-semibold text-sm block"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              {config?.label || dimension.type}
            </span>
            {!compact && config?.description && (
              <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                {config.description}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Score + Priority + Chevron */}
        <div className="flex items-center gap-3">
          {/* Score */}
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold"
              style={{
                color: passed ? BRAND_COLORS.success : BRAND_COLORS.error,
              }}
            >
              {Math.round(score)}%
            </span>
            {passed ? (
              <CheckCircle2 size={16} style={{ color: BRAND_COLORS.success }} />
            ) : (
              <AlertCircle size={16} style={{ color: BRAND_COLORS.error }} />
            )}
          </div>

          {/* Priority Badge */}
          <span
            className="px-2 py-0.5 rounded text-xs font-medium capitalize"
            style={{
              backgroundColor: `${priorityColor}15`,
              color: priorityColor,
            }}
          >
            {dimension.priority}
          </span>

          {/* Chevron */}
          <span style={{ color: BRAND_COLORS.textMuted }}>
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
        </div>
      </button>

      {/* Content - Expandable */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 space-y-3"
              style={{
                borderTop: `1px solid ${BRAND_COLORS.borderLight}`,
                paddingTop: '12px',
              }}
            >
              {/* Evidence */}
              {dimension.evidence && dimension.evidence.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.success }}>
                    Evidence Found
                  </p>
                  <ul className="space-y-1.5">
                    {dimension.evidence.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <CheckCircle2
                          size={12}
                          style={{ color: BRAND_COLORS.success }}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <span style={{ color: BRAND_COLORS.textSecondary }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gap Identified */}
              {dimension.gap_identified && (
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: BRAND_COLORS.bgWarning,
                    border: `1px solid ${BRAND_COLORS.warning}30`,
                  }}
                >
                  <p className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.warning }}>
                    Gap Identified
                  </p>
                  <p className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>
                    {dimension.gap_identified}
                  </p>
                </div>
              )}

              {/* Recommendation */}
              {dimension.recommendation && (
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: BRAND_COLORS.primaryBg,
                    border: `1px solid ${BRAND_COLORS.primary}30`,
                  }}
                >
                  <p className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.primary }}>
                    Recommendation
                  </p>
                  <p className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>
                    {dimension.recommendation}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TenDimensionsAccordion;
