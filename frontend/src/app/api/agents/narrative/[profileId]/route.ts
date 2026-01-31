/**
 * IvyQuest v10.0 - Get Narrative API Route
 * GET /api/agents/narrative/[profileId]
 *
 * Retrieves existing narrative for a profile, or synthesizes a new one.
 *
 * Returns:
 * - brand_statement: One powerful sentence (15-25 words)
 * - narrative_dna: 2-3 paragraph personalized story
 * - first_principle: The core "why" driving the student
 * - themes: Key recurring themes
 * - confidence: Synthesis confidence
 * - cached: Whether this was from cache or newly synthesized
 */

import { NextRequest, NextResponse } from 'next/server';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    const { profileId } = params;

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'profileId is required' },
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
    const response = await fetch(`${AGENT_SERVICE_URL}/agents/narrative/${profileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Get Narrative] Error:', errorText);
      return NextResponse.json(
        { success: false, error: `Agent service error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('[Get Narrative] Exception:', error);

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
