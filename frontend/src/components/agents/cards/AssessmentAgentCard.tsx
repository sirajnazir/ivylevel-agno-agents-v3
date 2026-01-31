/**
 * AssessmentAgentCard Component
 * v13.5 - Data Unification: Uses useProfileIdentity as primary source
 *
 * Data flow:
 * - Primary: useProfileIdentity (reads from DB)
 * - Fallback: useNarrativeDNA (for regeneration/refetch)
 * - identity_synthesis from useResultsStore for archetype badge
 */
'use client';

import { Brain } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';
import { useNarrativeDNA } from '@/hooks/useAgentData';
import { useProfileIdentity, useInvalidateProfileIdentity } from '@/hooks/useProfileIdentity';
import { useResultsStore } from '@/lib/store/useResultsStore';
import { AgentCardBase } from './AgentCardBase';
import { ArchetypeBadge } from '@/components/ui/ArchetypeBadge';

interface AssessmentAgentCardProps {
  profileId: string;
  onChat?: () => void;
  onViewDetails?: (data: Record<string, unknown>) => void;
}

export function AssessmentAgentCard({ profileId, onChat, onViewDetails }: AssessmentAgentCardProps) {
  // v5.2: Primary data source - Database via useProfileIdentity
  const { data: identity, isLoading: identityLoading } = useProfileIdentity(profileId);

  // Fallback/refetch capability via useNarrativeDNA
  const { data: narrativeData, isLoading: narrativeLoading, refetch, isFetching } = useNarrativeDNA(profileId);

  // Archetype from store (for backwards compatibility)
  const identity_synthesis = useResultsStore((state) => state.identity_synthesis);

  // Cache invalidation helper
  const invalidateIdentity = useInvalidateProfileIdentity();

  // Combine loading states
  const isLoading = identityLoading && narrativeLoading;

  // v5.2: Prefer DB data, fallback to API data
  const brandStatement = identity?.brandStatement || narrativeData?.rationale || '';
  const narrativeDna = identity?.narrativeDna || narrativeData?.dna || '';

  // Debug: Log what data we're receiving
  console.log('[AssessmentAgentCard] Data received:', {
    profileId,
    identityLoading,
    identityBrandStatement: identity?.brandStatement?.substring(0, 50),
    identityNarrativeDna: identity?.narrativeDna?.substring(0, 50),
    narrativeDataRationale: narrativeData?.rationale?.substring(0, 50),
    finalBrandStatement: brandStatement?.substring(0, 50),
  });
  const themes = (identity?.narrativeThemes?.length ?? 0) > 0
    ? identity?.narrativeThemes ?? []
    : narrativeData?.themes || [];
  const confidence = identity?.narrativeConfidence || narrativeData?.confidence || 0;
  const archetypeName = identity?.archetypeName || identity_synthesis?.archetype;

  // Handle regeneration with cache invalidation
  const handleRegenerate = async () => {
    await refetch();
    // Invalidate profile identity cache so it picks up new data
    invalidateIdentity(profileId);
  };

  const handleClick = () => {
    console.log('[AssessmentAgentCard] handleClick called, hasOnViewDetails:', !!onViewDetails);
    if (onViewDetails) {
      // Combine data for detail view
      const combinedData = {
        brandStatement,
        narrativeDna,
        themes,
        confidence,
        archetypeName,
        identity_synthesis: identity?.identitySynthesis || identity_synthesis,
        spike: identity?.spike,
        pillars: identity?.pillars,
      };
      console.log('[AssessmentAgentCard] Calling onViewDetails with:', Object.keys(combinedData));
      onViewDetails(combinedData);
    }
  };

  // Determine if we have any data to show
  const hasData = brandStatement || narrativeDna;

  return (
    <AgentCardBase
      title="Assessment Agent"
      icon={<Brain size={20} style={{ color: BRAND_COLORS.primary }} />}
      isLoading={isLoading || isFetching}
      isError={!isLoading && !hasData}
      onRefresh={handleRegenerate}
      onChat={onChat}
      onClick={handleClick}
    >
      {hasData && (
        <div className="space-y-3">
          {/* Brand Statement - NOW FROM DB (same source as AssessmentTab) */}
          {brandStatement && (
            <div>
              <p
                style={{ color: BRAND_COLORS.textMuted }}
                className="text-xs uppercase tracking-wide mb-1"
              >
                Brand Statement
              </p>
              <p
                style={{ color: BRAND_COLORS.textPrimary }}
                className="text-sm italic line-clamp-2"
              >
                "{brandStatement}"
              </p>
            </div>
          )}

          {/* Narrative DNA */}
          {narrativeDna && !brandStatement && (
            <div>
              <p
                style={{ color: BRAND_COLORS.textMuted }}
                className="text-xs uppercase tracking-wide mb-1"
              >
                Narrative DNA
              </p>
              <p
                style={{ color: BRAND_COLORS.textPrimary }}
                className="text-sm italic line-clamp-2"
              >
                "{narrativeDna}"
              </p>
            </div>
          )}

          {/* Themes */}
          {themes && themes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {themes.slice(0, 3).map((theme: string, i: number) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: BRAND_COLORS.primaryBg,
                    color: BRAND_COLORS.primary,
                  }}
                >
                  {theme}
                </span>
              ))}
            </div>
          )}

          {/* Archetype Badge (Strategic Intelligence v1.1.0) */}
          {archetypeName && (
            <div className="mt-2">
              <ArchetypeBadge
                archetype={archetypeName}
                size="sm"
                showConfidence={false}
              />
            </div>
          )}

          {/* Confidence */}
          {confidence > 0 && (
            <div className="flex items-center justify-between">
              <span style={{ color: BRAND_COLORS.textMuted }} className="text-sm">
                Confidence
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${confidence * 100}%`,
                      backgroundColor:
                        confidence >= 0.8
                          ? BRAND_COLORS.success
                          : confidence >= 0.6
                          ? BRAND_COLORS.warning
                          : BRAND_COLORS.error,
                    }}
                  />
                </div>
                <span style={{ color: BRAND_COLORS.textPrimary }} className="text-sm font-medium">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </AgentCardBase>
  );
}

export default AssessmentAgentCard;
