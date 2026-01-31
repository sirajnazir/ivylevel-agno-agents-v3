/**
 * IvyQuest v10.0 - Narrative Synthesis Agent API Route
 * POST /api/agents/narrative/synthesize
 *
 * v5.2: Now persists to database for data unification
 *
 * Proxies to Python agent service for narrative synthesis using Jenny's Formula:
 * IDENTITY + APTITUDE + PASSION + SERVICE = UNIQUE NARRATIVE
 *
 * Returns:
 * - brand_statement: One powerful sentence (15-25 words)
 * - narrative_dna: 2-3 paragraph personalized story
 * - first_principle: The core "why" driving the student
 * - themes: Key recurring themes
 * - confidence: Synthesis confidence (handoff if < 0.7)
 * - _db_persisted: Whether result was saved to database
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
    const { profile_id, assessment_contract } = body;

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
    const response = await fetch(`${AGENT_SERVICE_URL}/agents/narrative/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile_id, assessment_contract }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Narrative Synthesis Agent] Error:', errorText);
      return NextResponse.json(
        { success: false, error: `Agent service error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    // =========================================================================
    // v5.2: PERSIST TO DB (with graceful fallback)
    // =========================================================================
    let dbPersisted = false;

    try {
      const supabase = getSupabase();
      if (supabase && result.success !== false) {
        // Use the RPC function to update profile identity
        const { error } = await supabase.rpc('update_profile_identity', {
          p_profile_id: profile_id,
          p_brand_statement: result.brand_statement || null,
          p_narrative_dna: result.narrative_dna || null,
          p_narrative_themes: result.themes ? JSON.stringify(result.themes) : null,
          p_first_principle: result.first_principle || null,
          p_narrative_confidence: result.confidence || null,
          p_source: 'narrative_synthesize',
        });

        if (!error) {
          dbPersisted = true;
          console.log('[Narrative Synthesis Agent] Persisted to DB for profile:', profile_id);
        } else {
          console.warn('[Narrative Synthesis Agent] DB persistence failed:', error.message);
        }
      }
    } catch (dbError) {
      // Log but don't fail the request - graceful fallback
      console.warn('[Narrative Synthesis Agent] DB persistence failed, continuing:', dbError);
    }
    // =========================================================================

    // ALWAYS return the result - even if DB failed
    return NextResponse.json({
      ...result,
      _db_persisted: dbPersisted,
    });

  } catch (error) {
    console.error('[Narrative Synthesis Agent] Exception:', error);

    // Check if it's a connection error (agent service not running)
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
