/**
 * OpportunitiesCard - Tiered opportunity recommendations
 * v13.0 - 4-tier hierarchy with redirect detection
 */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb, RefreshCw, Loader2, ChevronDown, ChevronUp,
  ExternalLink, AlertTriangle, Star, Award, Building2, Wrench
} from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { agentV2Api, type ProgramRecommendResult } from '@/lib/api/agentV2Client';

interface OpportunitiesCardProps {
  studentProfile?: {
    spike?: string;
    primary_project?: string;
  };
  program?: {
    name: string;
    cost_numeric: number;
    category?: string;
    duration?: string;
  };
}

const TIER_CONFIG = {
  tier_1_selective_free: {
    label: 'TIER 1: SELECTIVE FREE',
    icon: Star,
    color: '#16a34a',
    bgColor: 'rgba(22, 163, 74, 0.1)',
    emoji: '🥇',
  },
  tier_2_government: {
    label: 'TIER 2: GOVERNMENT PROGRAMS',
    icon: Building2,
    color: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.1)',
    emoji: '🥈',
  },
  tier_3_technical: {
    label: 'TIER 3: TECHNICAL PROGRAMS',
    icon: Wrench,
    color: '#7c3aed',
    bgColor: 'rgba(124, 58, 237, 0.1)',
    emoji: '🥉',
  },
  tier_4_redirect: {
    label: 'TIER 4: CONSIDER ALTERNATIVES',
    icon: AlertTriangle,
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.1)',
    emoji: '⚠️',
  },
};

export function OpportunitiesCard({ studentProfile, program }: OpportunitiesCardProps) {
  const [recommendations, setRecommendations] = useState<ProgramRecommendResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await agentV2Api.recommendOpportunities({
        student_profile: studentProfile || { spike: 'general' },
        program: program,
      });
      setRecommendations(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [studentProfile, program]);

  const hasRecommendations = recommendations?.recommendations && (
    (recommendations.recommendations.tier_1_selective_free?.length || 0) > 0 ||
    (recommendations.recommendations.tier_2_government?.length || 0) > 0 ||
    (recommendations.recommendations.tier_3_technical?.length || 0) > 0 ||
    (recommendations.recommendations.tier_4_redirect?.length || 0) > 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border overflow-hidden"
      style={{ borderColor: BRAND_COLORS.borderLight }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer"
        style={{ backgroundColor: 'rgba(236, 72, 153, 0.05)' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)' }}
          >
            <Lightbulb size={20} style={{ color: '#db2777' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
              Opportunities For You
            </h3>
            <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
              Personalized program recommendations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              loadRecommendations();
            }}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" style={{ color: BRAND_COLORS.textMuted }} />
            ) : (
              <RefreshCw size={18} style={{ color: BRAND_COLORS.textMuted }} />
            )}
          </button>
          {isExpanded ? (
            <ChevronUp size={20} style={{ color: BRAND_COLORS.textMuted }} />
          ) : (
            <ChevronDown size={20} style={{ color: BRAND_COLORS.textMuted }} />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 py-4 space-y-4">
          {/* Error State */}
          {error && (
            <div
              className="p-4 rounded-lg text-sm"
              style={{ backgroundColor: BRAND_COLORS.bgError, color: BRAND_COLORS.error }}
            >
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && !recommendations && (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin mb-3" style={{ color: '#db2777' }} />
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Finding opportunities for you...
              </p>
            </div>
          )}

          {/* Redirect Alert */}
          {recommendations?.redirect && recommendations.redirect_response && (
            <div
              className="p-4 rounded-lg border-l-4"
              style={{
                backgroundColor: 'rgba(217, 119, 6, 0.05)',
                borderColor: '#d97706',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} style={{ color: '#d97706' }} />
                <span className="font-semibold text-sm" style={{ color: '#92400e' }}>
                  Redirect Alert
                </span>
              </div>
              <p className="text-sm mb-3" style={{ color: BRAND_COLORS.textPrimary }}>
                {recommendations.redirect_response.redirect_text}
              </p>

              <div className="space-y-2">
                <span className="text-xs font-medium" style={{ color: BRAND_COLORS.textMuted }}>
                  Free Alternatives:
                </span>
                <ul className="space-y-1">
                  {recommendations.redirect_response.free_alternatives?.map((alt, idx) => (
                    <li
                      key={idx}
                      className="text-sm flex items-center gap-2"
                      style={{ color: BRAND_COLORS.textPrimary }}
                    >
                      <span style={{ color: '#16a34a' }}>✓</span>
                      {alt}
                    </li>
                  ))}
                </ul>
              </div>

              {recommendations.redirect_response.self_directed_option && (
                <div
                  className="mt-3 p-2 rounded text-sm"
                  style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
                >
                  💡 <strong>Self-directed:</strong> {recommendations.redirect_response.self_directed_option}
                </div>
              )}

              {recommendations.redirect_response.jenny_quote && (
                <p
                  className="mt-3 text-sm italic"
                  style={{ color: BRAND_COLORS.secondary }}
                >
                  &ldquo;{recommendations.redirect_response.jenny_quote}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Tiered Recommendations */}
          {!recommendations?.redirect && hasRecommendations && (
            <div className="space-y-4">
              {/* Tier 1 */}
              {recommendations?.recommendations?.tier_1_selective_free &&
                recommendations.recommendations.tier_1_selective_free.length > 0 && (
                <TierSection
                  tier="tier_1_selective_free"
                  programs={recommendations.recommendations.tier_1_selective_free}
                />
              )}

              {/* Tier 2 */}
              {recommendations?.recommendations?.tier_2_government &&
                recommendations.recommendations.tier_2_government.length > 0 && (
                <TierSection
                  tier="tier_2_government"
                  programs={recommendations.recommendations.tier_2_government}
                />
              )}

              {/* Tier 3 */}
              {recommendations?.recommendations?.tier_3_technical &&
                recommendations.recommendations.tier_3_technical.length > 0 && (
                <TierSection
                  tier="tier_3_technical"
                  programs={recommendations.recommendations.tier_3_technical}
                />
              )}

              {/* Tier 4 */}
              {recommendations?.recommendations?.tier_4_redirect &&
                recommendations.recommendations.tier_4_redirect.length > 0 && (
                <TierSection
                  tier="tier_4_redirect"
                  programs={recommendations.recommendations.tier_4_redirect}
                />
              )}
            </div>
          )}

          {/* Empty State */}
          {!recommendations && !isLoading && !error && (
            <div className="py-8 text-center">
              <Lightbulb size={40} className="mx-auto mb-3" style={{ color: BRAND_COLORS.textMuted }} />
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Complete your profile to get personalized opportunities
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

interface TierSectionProps {
  tier: keyof typeof TIER_CONFIG;
  programs: Array<{ name: string; fit: string; jenny_note?: string }>;
}

function TierSection({ tier, programs }: TierSectionProps) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span>{config.emoji}</span>
        <span className="text-xs font-semibold" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>
      <div className="space-y-2">
        {programs.map((program, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg"
            style={{ backgroundColor: config.bgColor }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm" style={{ color: BRAND_COLORS.textHeading }}>
                {program.name}
              </span>
              <ExternalLink size={14} style={{ color: config.color }} />
            </div>
            <p className="text-sm" style={{ color: BRAND_COLORS.textPrimary }}>
              {program.fit}
            </p>
            {program.jenny_note && (
              <p
                className="mt-2 text-xs italic"
                style={{ color: BRAND_COLORS.textMuted }}
              >
                Jenny: &ldquo;{program.jenny_note}&rdquo;
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OpportunitiesCard;
