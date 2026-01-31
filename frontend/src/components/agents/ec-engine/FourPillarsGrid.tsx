/**
 * FourPillarsGrid Component
 * =========================
 *
 * Displays the 4 Pillars of compelling ECs:
 * IDENTITY + APTITUDE + PASSION + SERVICE = UNIQUE NARRATIVE
 *
 * Visual grid layout showing evidence, strength, and gaps for each pillar.
 */
'use client';

import { Brain, Heart, Users, Fingerprint, CheckCircle2, AlertCircle } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import type { FourPillarsData, PillarData, PillarType } from '@/lib/types/react-visualization';
import { PILLAR_COLORS } from '@/lib/types/react-visualization';

interface FourPillarsGridProps {
  data: FourPillarsData;
  compact?: boolean;
  onPillarClick?: (pillar: PillarType) => void;
}

// Pillar icons mapping
const PILLAR_ICONS: Record<PillarType, React.ReactNode> = {
  IDENTITY: <Fingerprint size={24} />,
  APTITUDE: <Brain size={24} />,
  PASSION: <Heart size={24} />,
  SERVICE: <Users size={24} />,
};

// Pillar labels
const PILLAR_LABELS: Record<PillarType, { title: string; description: string }> = {
  IDENTITY: {
    title: 'Identity',
    description: 'Who you are and your unique background',
  },
  APTITUDE: {
    title: 'Aptitude',
    description: 'Your demonstrated skills and abilities',
  },
  PASSION: {
    title: 'Passion',
    description: 'What drives and motivates you',
  },
  SERVICE: {
    title: 'Service',
    description: 'How you give back to others',
  },
};

export function FourPillarsGrid({
  data,
  compact = false,
  onPillarClick,
}: FourPillarsGridProps) {
  const pillars: PillarType[] = ['IDENTITY', 'APTITUDE', 'PASSION', 'SERVICE'];

  // Get pillar data by type
  const getPillarData = (type: PillarType): PillarData => {
    const key = type.toLowerCase() as keyof FourPillarsData;
    return (data[key] as PillarData) || {
      type,
      label: PILLAR_LABELS[type].title,
      evidence: [],
      strength: 0,
      missing: [],
      color: PILLAR_COLORS[type],
      icon: type,
    };
  };

  return (
    <div className="space-y-4">
      {/* Header with Formula */}
      <div
        className="text-center p-4 rounded-xl"
        style={{
          backgroundColor: BRAND_COLORS.bgSecondary,
          border: `1px solid ${BRAND_COLORS.borderLight}`,
        }}
      >
        <div className="flex items-center justify-center gap-2 text-sm font-semibold flex-wrap">
          {pillars.map((pillar, idx) => (
            <span key={pillar} className="flex items-center gap-1">
              <span style={{ color: PILLAR_COLORS[pillar] }}>
                {PILLAR_LABELS[pillar].title.toUpperCase()}
              </span>
              {idx < pillars.length - 1 && (
                <span style={{ color: BRAND_COLORS.textMuted }}>+</span>
              )}
            </span>
          ))}
          <span style={{ color: BRAND_COLORS.textMuted }}>=</span>
          <span style={{ color: BRAND_COLORS.primary }}>UNIQUE NARRATIVE</span>
        </div>

        {/* Overall Balance Score */}
        {data.overall_balance !== undefined && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
              Portfolio Balance:
            </span>
            <span
              className="text-sm font-bold"
              style={{
                color: data.overall_balance >= 70 ? BRAND_COLORS.success : BRAND_COLORS.warning,
              }}
            >
              {Math.round(data.overall_balance)}%
            </span>
          </div>
        )}
      </div>

      {/* Pillars Grid */}
      <div className={`grid ${compact ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4'}`}>
        {pillars.map((pillarType) => {
          const pillar = getPillarData(pillarType);
          const isDominant = data.dominant_pillar === pillarType;
          const isWeakest = data.weakest_pillar === pillarType;

          return (
            <PillarCard
              key={pillarType}
              pillar={pillar}
              pillarType={pillarType}
              isDominant={isDominant}
              isWeakest={isWeakest}
              compact={compact}
              onClick={onPillarClick ? () => onPillarClick(pillarType) : undefined}
            />
          );
        })}
      </div>

      {/* Narrative Thread */}
      {data.narrative_thread && (
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: BRAND_COLORS.primaryBg,
            border: `1px solid ${BRAND_COLORS.primary}30`,
          }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.primary }}>
            Narrative Thread
          </p>
          <p className="text-sm" style={{ color: BRAND_COLORS.textPrimary }}>
            {data.narrative_thread}
          </p>
        </div>
      )}
    </div>
  );
}

// Individual Pillar Card
interface PillarCardProps {
  pillar: PillarData;
  pillarType: PillarType;
  isDominant?: boolean;
  isWeakest?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

function PillarCard({
  pillar,
  pillarType,
  isDominant,
  isWeakest,
  compact,
  onClick,
}: PillarCardProps) {
  const color = PILLAR_COLORS[pillarType];
  const label = PILLAR_LABELS[pillarType];
  const strength = pillar.strength || 0;

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      style={{
        backgroundColor: BRAND_COLORS.bgPrimary,
        border: `2px solid ${isDominant ? color : isWeakest ? BRAND_COLORS.warning : BRAND_COLORS.borderLight}`,
        boxShadow: isDominant ? `0 4px 12px ${color}20` : 'none',
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div
        className="px-3 py-2 flex items-center justify-between"
        style={{
          backgroundColor: `${color}10`,
          borderBottom: `1px solid ${color}20`,
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color }}>{PILLAR_ICONS[pillarType]}</span>
          <span className="font-semibold text-sm" style={{ color }}>
            {label.title}
          </span>
        </div>
        {isDominant && (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{ backgroundColor: color, color: 'white' }}
          >
            Strong
          </span>
        )}
        {isWeakest && (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{ backgroundColor: BRAND_COLORS.warning, color: 'white' }}
          >
            Gap
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Strength Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: BRAND_COLORS.textMuted }}>Strength</span>
            <span style={{ color: strength >= 70 ? BRAND_COLORS.success : strength >= 40 ? BRAND_COLORS.warning : BRAND_COLORS.error }}>
              {Math.round(strength)}%
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: BRAND_COLORS.bgSecondary }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${strength}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>

        {/* Evidence (show only if not compact) */}
        {!compact && pillar.evidence && pillar.evidence.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.textMuted }}>
              Evidence
            </p>
            <div className="space-y-1">
              {pillar.evidence.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-start gap-1 text-xs">
                  <CheckCircle2 size={12} style={{ color: BRAND_COLORS.success }} className="mt-0.5 flex-shrink-0" />
                  <span style={{ color: BRAND_COLORS.textSecondary }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing (show only if not compact and has gaps) */}
        {!compact && pillar.missing && pillar.missing.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.warning }}>
              Opportunities
            </p>
            <div className="space-y-1">
              {pillar.missing.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-start gap-1 text-xs">
                  <AlertCircle size={12} style={{ color: BRAND_COLORS.warning }} className="mt-0.5 flex-shrink-0" />
                  <span style={{ color: BRAND_COLORS.textSecondary }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FourPillarsGrid;
