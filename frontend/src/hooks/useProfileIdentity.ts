/**
 * useProfileIdentity Hook - v5.2 Data Unification
 * ================================================
 *
 * Single source of truth for IDENTITY data from database.
 * Does NOT replace useResultsStore for scoring data (Frames depend on it).
 *
 * Features:
 * - Reads identity data from profiles table via RPC
 * - Null-safe defaults from DB function
 * - Shorter stale time (30s) for freshness
 * - Export query invalidation helper
 *
 * Usage:
 *   const { data: identity, isLoading } = useProfileIdentity(profileId);
 *   const brandStatement = identity?.brandStatement || '';
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { ProfileIdentity } from '@/lib/types/profileIdentity';
import { profileIdentityKeys } from '@/lib/types/profileIdentity';

// ============================================================================
// TRANSFORM FUNCTION
// ============================================================================



// ============================================================================
// HOOKS
// ============================================================================

/**
 * Fetch profile identity from database.
 * Use this for brand_statement, spike, pillars - NOT for scoring data.
 */
export function useProfileIdentity(profileId: string | null) {
    return useQuery({
        queryKey: profileIdentityKeys.byId(profileId || ''),
        queryFn: async (): Promise<ProfileIdentity | null> => {
            if (!profileId) return null;

            try {
                const supabase = getSupabaseClient();
                // Query V2 table directly
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, user_id, first_name, last_name, email, grade, identity_synthesis, four_pillars')
                    .eq('user_id', profileId) // V2 uses user_id as foreign key but we might be passing user_id or profile_id. 
                    // Profiles table has id (uuid) and user_id (uuid). 
                    // Usually profileId passed here IS the user_id in the new flow, but let's try both to be safe or stick to user_id if assured.
                    // The dashboard passes `profileId = user?.id`. So it is user_id.
                    .maybeSingle();

                if (error) {
                    console.error('[useProfileIdentity] Query error:', error);
                    return null;
                }

                if (!data) {
                    console.log('[useProfileIdentity] No profile found for:', profileId);
                    return null;
                }

                // Map V2 data to ProfileIdentity interface
                const synthesis = data.identity_synthesis as any || {};
                const pillars = data.four_pillars as any || {};

                return {
                    id: data.id,
                    userId: data.user_id,
                    name: `${data.first_name} ${data.last_name || ''}`.trim(),
                    email: data.email,
                    grade: data.grade,

                    // Identity Synthesis
                    archetypeId: synthesis.archetype?.id || 'scholar',
                    archetypeName: synthesis.archetype?.name || 'Scholar',
                    archetypeConfidence: synthesis.archetype?.confidence || 0,
                    brandStatement: synthesis.brand_statement || '',
                    narrativeDna: synthesis.narrative_dna || '',
                    narrativeThemes: synthesis.themes || [],
                    firstPrinciple: synthesis.first_principle || '',
                    spike: synthesis.spike || '',
                    spikeConfidence: synthesis.spike_confidence || 0,

                    // Pillars (map from synthesis or four_pillars)
                    pillars: Object.keys(pillars).length > 0 ? Object.keys(pillars) : [], // Just keys as string[] for legacy prop? 
                    // Wait, original transformDbRow mapped pillars to string[]. 
                    // Let's see what the UI expects for 'pillars'. 
                    // Original: pillars: string[].

                    identitySynthesis: synthesis,
                    narrativeConfidence: synthesis.confidence || 0,
                    lastSynthesizedAt: new Date().toISOString(), // approximation
                };
            } catch (err) {
                console.error('[useProfileIdentity] Exception:', err);
                return null;
            }
        },
        enabled: !!profileId,
        staleTime: 30 * 1000, // 30 seconds - shorter for freshness
        gcTime: 5 * 60 * 1000, // 5 minutes cache
        retry: 1, // Only retry once
        refetchOnWindowFocus: false,
    });
}

/**
 * Hook to invalidate profile identity cache.
 * Call this after generating new narrative.
 */
export function useInvalidateProfileIdentity() {
    const queryClient = useQueryClient();

    return (profileId: string) => {
        queryClient.invalidateQueries({
            queryKey: profileIdentityKeys.byId(profileId),
        });
        console.log('[useProfileIdentity] Cache invalidated for:', profileId);
    };
}

/**
 * Combined hook that provides both data and invalidation.
 */
export function useProfileIdentityWithInvalidation(profileId: string | null) {
    const query = useProfileIdentity(profileId);
    const invalidate = useInvalidateProfileIdentity();

    return {
        ...query,
        invalidate: () => profileId && invalidate(profileId),
    };
}

/**
 * Prefetch profile identity for a given profile ID.
 * Useful for prefetching before navigation.
 * Note: Uses same query logic as useProfileIdentity for consistency.
 */
export function usePrefetchProfileIdentity() {
    const queryClient = useQueryClient();

    return async (profileId: string) => {
        await queryClient.prefetchQuery({
            queryKey: profileIdentityKeys.byId(profileId),
            queryFn: async () => {
                const supabase = getSupabaseClient();
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, user_id, first_name, last_name, email, grade, identity_synthesis, four_pillars')
                    .eq('user_id', profileId)
                    .maybeSingle();

                if (error || !data) return null;

                // Same mapping logic as useProfileIdentity
                const synthesis = data.identity_synthesis as any || {};
                const pillars = data.four_pillars as any || {};

                return {
                    id: data.id,
                    userId: data.user_id,
                    name: `${data.first_name} ${data.last_name || ''}`.trim(),
                    email: data.email,
                    grade: data.grade,
                    archetypeId: synthesis.archetype?.id || 'scholar',
                    archetypeName: synthesis.archetype?.name || 'Scholar',
                    archetypeConfidence: synthesis.archetype?.confidence || 0,
                    brandStatement: synthesis.brand_statement || '',
                    narrativeDna: synthesis.narrative_dna || '',
                    narrativeThemes: synthesis.themes || [],
                    firstPrinciple: synthesis.first_principle || '',
                    spike: synthesis.spike || '',
                    spikeConfidence: synthesis.spike_confidence || 0,
                    pillars: Object.keys(pillars).length > 0 ? Object.keys(pillars) : [],
                    identitySynthesis: synthesis,
                    narrativeConfidence: synthesis.confidence || 0,
                    lastSynthesizedAt: new Date().toISOString(),
                };
            },
            staleTime: 30 * 1000,
        });
    };
}
