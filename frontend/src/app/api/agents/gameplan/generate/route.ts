/**
 * IvyQuest v10.0 - Game Plan Agent: Generate
 * POST /api/agents/gameplan/generate
 *
 * v5.2: Now persists to database for data unification
 *
 * Generates comprehensive game plan with:
 * - ACP-004: Strategic Overwhelm (1.4x capacity)
 * - ACP-005: Multi-Touchpoint Leverage (4+ touchpoints or filter)
 * - ACP-006: Identity Seed Architecture (6-12mo ahead)
 *
 * Returns:
 * - game_plan: Full game plan data
 * - _db_persisted: { profile: bool, game_plan: bool }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';

// Create Supabase client for DB persistence
const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id } = body;

    if (!profile_id) {
      return NextResponse.json(
        { success: false, error: 'profile_id is required' },
        { status: 400 }
      );
    }

    // Check if agents are enabled
    if (process.env.ENABLE_AGENTS !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Agents are disabled. Set ENABLE_AGENTS=true' },
        { status: 503 }
      );
    }

    // Proxy to agent service
    const response = await fetch(`${AGENT_SERVICE_URL}/agents/gameplan/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile_id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Game Plan Agent] Error:', errorText);
      return NextResponse.json(
        { success: false, error: `Agent service error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    // =========================================================================
    // v5.2: PERSIST TO DB (with graceful fallback)
    // =========================================================================
    let profilePersisted = false;
    let gamePlanPersisted = false;

    try {
      const supabase = getSupabase();
      if (supabase && result.success !== false) {
        // 1. Extract identity synthesis from result
        const gamePlanData = result.game_plan || result;
        const identitySynthesis = gamePlanData.identity_synthesis ||
                                  gamePlanData.ec_generation?.identity_synthesis;

        // 2. Persist identity to profiles table
        if (identitySynthesis) {
          const { error: profileError } = await supabase.rpc('update_profile_identity', {
            p_profile_id: profile_id,
            p_brand_statement: identitySynthesis.brand_statement ||
                              identitySynthesis.master_narrative || null,
            p_narrative_dna: identitySynthesis.narrative_dna ||
                            identitySynthesis.master_narrative || null,
            p_spike: identitySynthesis.spike || null,
            p_spike_confidence: identitySynthesis.spike_confidence ||
                               identitySynthesis.archetype_confidence || null,
            p_pillars: identitySynthesis.pillars ?
                      JSON.stringify(identitySynthesis.pillars) : null,
            p_identity_synthesis: JSON.stringify(identitySynthesis),
            p_source: 'gameplan_generate',
          });

          profilePersisted = !profileError;
          if (profileError) {
            console.warn('[Game Plan Agent] Profile persistence failed:', profileError.message);
          } else {
            console.log('[Game Plan Agent] Profile identity persisted for:', profile_id);
          }
        }

        // 3. Get user_id for game_plans table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('id', profile_id)
          .single();

        if (profileData?.user_id) {
          // 4. Persist to game_plans table using upsert RPC
          const { error: gamePlanError } = await supabase.rpc('upsert_game_plan', {
            p_profile_id: profile_id,
            p_user_id: profileData.user_id,
            p_plan_data: JSON.stringify(gamePlanData),
            p_ec_generation: gamePlanData.ec_generation ?
                            JSON.stringify(gamePlanData.ec_generation) : null,
            p_awards_data: gamePlanData.awards ?
                          JSON.stringify(gamePlanData.awards) : null,
            p_programs_data: gamePlanData.programs ?
                            JSON.stringify(gamePlanData.programs) : null,
            p_react_metadata: result._react ?
                             JSON.stringify(result._react) : null,
            p_generation_version: '5.2',
          });

          gamePlanPersisted = !gamePlanError;
          if (gamePlanError) {
            console.warn('[Game Plan Agent] GamePlan persistence failed:', gamePlanError.message);
          } else {
            console.log('[Game Plan Agent] GamePlan persisted for:', profile_id);
          }
        }
      }
    } catch (dbError) {
      // Log but don't fail the request - graceful fallback
      console.warn('[Game Plan Agent] DB persistence failed, continuing:', dbError);
    }
    // =========================================================================

    // ALWAYS return the result - even if DB failed
    return NextResponse.json({
      ...result,
      _db_persisted: {
        profile: profilePersisted,
        game_plan: gamePlanPersisted,
      },
    });

  } catch (error) {
    console.error('[Game Plan Agent] Exception:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent service is not running. Start with: cd agents && python main.py',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
