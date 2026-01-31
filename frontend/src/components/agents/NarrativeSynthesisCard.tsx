/**
 * NarrativeSynthesisCard - Display brand statement and narrative DNA
 * v13.0 - Part of the multi-agent dashboard
 */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { agentV2Api, type NarrativeSynthesisResult } from '@/lib/api/agentV2Client';
import { useProfileId } from '@/lib/store/useSessionStore';

interface NarrativeSynthesisCardProps {
  onNarrativeLoad?: (narrative: NarrativeSynthesisResult) => void;
}

export function NarrativeSynthesisCard({ onNarrativeLoad }: NarrativeSynthesisCardProps) {
  const profileId = useProfileId();
  const [narrative, setNarrative] = useState<NarrativeSynthesisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const loadNarrative = async () => {
    if (!profileId) {
      setError('No profile ID available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await agentV2Api.synthesizeNarrative({ profile_id: profileId });
      setNarrative(result);
      onNarrativeLoad?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to synthesize narrative');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      loadNarrative();
    }
  }, [profileId]);

  const confidencePercent = narrative?.confidence ? Math.round(narrative.confidence * 100) : 0;

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
        style={{ backgroundColor: 'rgba(100, 20, 50, 0.05)' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: BRAND_COLORS.primaryBg }}
          >
            <BookOpen size={20} style={{ color: BRAND_COLORS.secondary }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
              Your Story DNA
            </h3>
            <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
              Narrative synthesis and brand identity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              loadNarrative();
            }}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Regenerate"
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
        <div className="px-6 py-4 space-y-5">
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
          {isLoading && !narrative && (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin mb-3" style={{ color: BRAND_COLORS.primary }} />
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Synthesizing your narrative...
              </p>
            </div>
          )}

          {/* Content */}
          {narrative && !isLoading && (
            <>
              {/* Archetype */}
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'rgba(100, 20, 50, 0.03)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: BRAND_COLORS.textMuted }}>
                    Archetype
                  </span>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: confidencePercent >= 80 ? BRAND_COLORS.bgSuccess : BRAND_COLORS.bgWarning,
                      color: confidencePercent >= 80 ? BRAND_COLORS.success : BRAND_COLORS.warning,
                    }}
                  >
                    {confidencePercent}% confidence
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={18} style={{ color: BRAND_COLORS.secondary }} />
                  <span className="font-semibold" style={{ color: BRAND_COLORS.textHeading }}>
                    {narrative.archetype || 'Discovering...'}
                  </span>
                </div>
                <p className="text-sm" style={{ color: BRAND_COLORS.textPrimary }}>
                  {narrative.archetype_description || 'Your unique archetype is being identified...'}
                </p>
              </div>

              {/* Brand Statement */}
              <div>
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: BRAND_COLORS.textMuted }}>
                  Brand Statement
                </span>
                <div
                  className="mt-2 p-4 rounded-lg border-l-4"
                  style={{
                    backgroundColor: 'rgba(255, 74, 35, 0.03)',
                    borderColor: BRAND_COLORS.primary,
                  }}
                >
                  <p className="text-base italic" style={{ color: BRAND_COLORS.textHeading }}>
                    &ldquo;{narrative.brand_statement || 'Your brand statement is being crafted...'}&rdquo;
                  </p>
                </div>
              </div>

              {/* Themes */}
              {narrative.themes && narrative.themes.length > 0 && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: BRAND_COLORS.textMuted }}>
                    Core Themes
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {narrative.themes.map((theme, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: BRAND_COLORS.primaryBg,
                          color: BRAND_COLORS.secondary,
                        }}
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Identity Seeds */}
              {narrative.identity_seeds && narrative.identity_seeds.length > 0 && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: BRAND_COLORS.textMuted }}>
                    Identity Seeds
                  </span>
                  <ul className="mt-2 space-y-1.5">
                    {narrative.identity_seeds.map((seed, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: BRAND_COLORS.textPrimary }}
                      >
                        <span style={{ color: BRAND_COLORS.primary }}>•</span>
                        {seed}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* First Principle */}
              {narrative.first_principle && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: BRAND_COLORS.bgSuccess,
                    color: BRAND_COLORS.success,
                  }}
                >
                  <span className="font-medium">First Principle: </span>
                  {narrative.first_principle}
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!narrative && !isLoading && !error && (
            <div className="py-8 text-center">
              <BookOpen size={40} className="mx-auto mb-3" style={{ color: BRAND_COLORS.textMuted }} />
              <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                Complete your assessment to unlock your narrative synthesis
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default NarrativeSynthesisCard;
