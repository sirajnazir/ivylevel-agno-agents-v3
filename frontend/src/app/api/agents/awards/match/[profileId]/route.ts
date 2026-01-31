/**
 * IvyQuest v10.0 - Awards Agent: Match
 * GET /api/agents/awards/match/[profileId]
 *
 * Matches profile to awards with ROI calculation.
 * Returns portfolio balanced with: likely + stretch + skip
 *
 * Target: >40% win rate (Huda benchmark: 62.5% = 5/8)
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
    const response = await fetch(
      `${AGENT_SERVICE_URL}/agents/awards/match/${profileId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Awards Agent] Error:', errorText);
      return NextResponse.json(
        { success: false, error: `Agent service error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('[Awards Agent] Exception:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent service is not running',
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
