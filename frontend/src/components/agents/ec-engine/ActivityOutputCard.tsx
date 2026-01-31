/**
 * ActivityOutputCard Component
 * ============================
 *
 * Displays a generated activity with full context:
 * - 4 Pillars mapping (which pillars this activity addresses)
 * - 10 Dimensions mapping (which dimensions this activity covers)
 * - Gap filled (what gap this activity fills)
 * - "Only They" test score and pass/fail status
 * - "Despite → Because" reframe (if applicable)
 * - Quality metrics (specificity, narrative alignment, ROI)
 */
'use client';

import {
  Fingerprint,
  Brain,
  Heart,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Sparkles,
  ArrowRight,
  Tag,
  Target,
} from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import type { GeneratedActivity, PillarType, DimensionType } from '@/lib/types/react-visualization';
import { PILLAR_COLORS, DIMENSION_CONFIG } from '@/lib/types/react-visualization';

interface ActivityOutputCardProps {
  activity: GeneratedActivity;
  index?: number;
  showPillars?: boolean;
  showDimensions?: boolean;
  showReframe?: boolean;
  showMetrics?: boolean;
  compact?: boolean;
}

// Pillar icons mapping
const PILLAR_ICONS: Record<PillarType, React.ReactNode> = {
  IDENTITY: <Fingerprint size={14} />,
  APTITUDE: <Brain size={14} />,
  PASSION: <Heart size={14} />,
  SERVICE: <Users size={14} />,
};

// Pillar labels
const PILLAR_LABELS: Record<PillarType, string> = {
  IDENTITY: 'Identity',
  APTITUDE: 'Aptitude',
  PASSION: 'Passion',
  SERVICE: 'Service',
};

export function ActivityOutputCard({
  activity,
  index,
  showPillars = true,
  showDimensions = true,
  showReframe = true,
  showMetrics = true,
  compact = false,
}: ActivityOutputCardProps) {
  const onlyTheyPassed = activity.only_they_passed;
  const onlyTheyScore = activity.only_they_score || 0;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: BRAND_COLORS.bgPrimary,
        border: `1px solid ${onlyTheyPassed ? BRAND_COLORS.success + '40' : BRAND_COLORS.borderLight}`,
        boxShadow: onlyTheyPassed ? `0 4px 12px ${BRAND_COLORS.success}15` : 'none',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-start justify-between gap-3"
        style={{
          backgroundColor: onlyTheyPassed ? BRAND_COLORS.bgSuccess : BRAND_COLORS.bgSecondary,
          borderBottom: `1px solid ${BRAND_COLORS.borderLight}`,
        }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {index !== undefined && (
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: BRAND_COLORS.primary,
                  color: 'white',
                }}
              >
                {index + 1}
              </span>
            )}
            <h3
              className="font-semibold text-sm"
              style={{ color: BRAND_COLORS.textHeading }}
            >
              {activity.name}
            </h3>
          </div>
          {activity.category && (
            <span
              className="text-xs mt-1 inline-block"
              style={{ color: BRAND_COLORS.textMuted }}
            >
              {activity.category}
            </span>
          )}
        </div>

        {/* Only They Score */}
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Sparkles size={14} style={{ color: onlyTheyPassed ? BRAND_COLORS.success : BRAND_COLORS.error }} />
            <span
              className="text-sm font-bold"
              style={{ color: onlyTheyPassed ? BRAND_COLORS.success : BRAND_COLORS.error }}
            >
              {Math.round(onlyTheyScore)}%
            </span>
          </div>
          <span
            className="text-xs"
            style={{ color: onlyTheyPassed ? BRAND_COLORS.success : BRAND_COLORS.error }}
          >
            {onlyTheyPassed ? '"Only They" Pass' : '"Only They" Fail'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Description */}
        {activity.description && (
          <p className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
            {activity.description}
          </p>
        )}

        {/* Gap Filled */}
        {activity.gap_filled && (
          <div
            className="p-3 rounded-lg flex items-start gap-2"
            style={{
              backgroundColor: BRAND_COLORS.primaryBg,
              border: `1px solid ${BRAND_COLORS.primary}30`,
            }}
          >
            <Target size={16} style={{ color: BRAND_COLORS.primary }} className="mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-medium" style={{ color: BRAND_COLORS.primary }}>
                Gap Filled ({activity.gap_type || 'MISSING'})
              </span>
              <p className="text-xs mt-0.5" style={{ color: BRAND_COLORS.textSecondary }}>
                {activity.gap_filled}
              </p>
            </div>
          </div>
        )}

        {/* Pillars Mapping */}
        {showPillars && activity.pillars && activity.pillars.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.textMuted }}>
              Pillars Addressed
            </p>
            <div className="flex flex-wrap gap-2">
              {activity.pillars.map((pillar) => (
                <PillarBadge
                  key={pillar}
                  pillar={pillar}
                  evidence={activity.pillar_evidence?.[pillar]}
                  compact={compact}
                />
              ))}
            </div>
          </div>
        )}

        {/* Dimensions Mapping */}
        {showDimensions && activity.dimensions_addressed && activity.dimensions_addressed.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.textMuted }}>
              Dimensions Covered ({activity.dimensions_addressed.length}/10)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {activity.dimensions_addressed.map((dim) => (
                <DimensionBadge
                  key={dim}
                  dimension={dim}
                  evidence={activity.dimension_evidence?.[dim]}
                  compact={compact}
                />
              ))}
            </div>
          </div>
        )}

        {/* Despite → Because Reframe */}
        {showReframe && activity.despite_because && (
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: BRAND_COLORS.bgSuccess,
              border: `1px solid ${BRAND_COLORS.success}30`,
            }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: BRAND_COLORS.success }}>
              Despite → Because Reframe
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span
                  className="px-2 py-1 rounded"
                  style={{
                    backgroundColor: BRAND_COLORS.bgError,
                    color: BRAND_COLORS.error,
                  }}
                >
                  DESPITE
                </span>
                <span style={{ color: BRAND_COLORS.textSecondary }}>
                  {activity.despite_because.constraint}
                </span>
              </div>
              <ArrowRight size={16} style={{ color: BRAND_COLORS.textMuted, marginLeft: '4px' }} />
              <div className="flex items-center gap-2 text-xs">
                <span
                  className="px-2 py-1 rounded"
                  style={{
                    backgroundColor: BRAND_COLORS.bgSuccess,
                    color: BRAND_COLORS.success,
                  }}
                >
                  BECAUSE
                </span>
                <span style={{ color: BRAND_COLORS.textSecondary }}>
                  {activity.despite_because.reframe}
                </span>
              </div>
              {activity.despite_because.narrative_angle && (
                <p className="text-xs mt-2 italic" style={{ color: BRAND_COLORS.textMuted }}>
                  Narrative: {activity.despite_because.narrative_angle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Metrics */}
        {showMetrics && !compact && (
          <div
            className="grid grid-cols-4 gap-3 pt-3"
            style={{ borderTop: `1px solid ${BRAND_COLORS.borderLight}` }}
          >
            <MetricBadge
              label="Specificity"
              value={activity.specificity_score}
              icon={<Target size={12} />}
              showPercent
            />
            <MetricBadge
              label="Narrative Fit"
              value={activity.narrative_alignment}
              icon={<Sparkles size={12} />}
              showPercent
            />
            <MetricBadge
              label="Hours"
              value={activity.hours_required}
              icon={<Clock size={12} />}
            />
            <MetricBadge
              label="ROI"
              value={activity.roi}
              icon={<Star size={12} />}
              suffix="x"
            />
          </div>
        )}

        {/* Touchpoints */}
        {activity.touchpoints && activity.touchpoints.length > 0 && !compact && (
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.textMuted }}>
              Touchpoints ({activity.touchpoints.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {activity.touchpoints.slice(0, 6).map((tp, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: BRAND_COLORS.bgSecondary,
                    color: BRAND_COLORS.textSecondary,
                    border: `1px solid ${BRAND_COLORS.borderLight}`,
                  }}
                >
                  {tp}
                </span>
              ))}
              {activity.touchpoints.length > 6 && (
                <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                  +{activity.touchpoints.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Pillar Badge Component
function PillarBadge({
  pillar,
  evidence,
  compact,
}: {
  pillar: PillarType;
  evidence?: string;
  compact?: boolean;
}) {
  const color = PILLAR_COLORS[pillar];

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${compact ? '' : 'pr-3'}`}
      style={{
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`,
      }}
      title={evidence}
    >
      <span style={{ color }}>{PILLAR_ICONS[pillar]}</span>
      <span className="text-xs font-medium" style={{ color }}>
        {PILLAR_LABELS[pillar]}
      </span>
      {!compact && evidence && (
        <CheckCircle2 size={12} style={{ color: BRAND_COLORS.success }} />
      )}
    </div>
  );
}

// Dimension Badge Component
function DimensionBadge({
  dimension,
  evidence,
  compact,
}: {
  dimension: DimensionType;
  evidence?: string;
  compact?: boolean;
}) {
  const config = DIMENSION_CONFIG[dimension];

  return (
    <span
      className="px-2 py-0.5 rounded text-xs flex items-center gap-1"
      style={{
        backgroundColor: BRAND_COLORS.bgSecondary,
        color: BRAND_COLORS.textSecondary,
        border: `1px solid ${BRAND_COLORS.borderLight}`,
      }}
      title={evidence || config?.description}
    >
      {config?.label || dimension}
      {evidence && !compact && (
        <CheckCircle2 size={10} style={{ color: BRAND_COLORS.success }} />
      )}
    </span>
  );
}

// Metric Badge Component
function MetricBadge({
  label,
  value,
  icon,
  showPercent,
  suffix,
}: {
  label: string;
  value?: number;
  icon: React.ReactNode;
  showPercent?: boolean;
  suffix?: string;
}) {
  if (value === undefined) return null;

  const displayValue = showPercent ? Math.round(value) : value.toFixed(1);
  const isGood = showPercent ? value >= 70 : value >= 1.5;

  return (
    <div className="text-center">
      <div
        className="flex items-center justify-center gap-1 text-sm font-semibold"
        style={{
          color: showPercent
            ? isGood
              ? BRAND_COLORS.success
              : BRAND_COLORS.warning
            : BRAND_COLORS.textHeading,
        }}
      >
        {icon}
        <span>
          {displayValue}
          {showPercent ? '%' : suffix || ''}
        </span>
      </div>
      <p className="text-xs mt-0.5" style={{ color: BRAND_COLORS.textMuted }}>
        {label}
      </p>
    </div>
  );
}

export default ActivityOutputCard;
