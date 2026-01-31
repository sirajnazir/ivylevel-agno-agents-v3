/**
 * IvyQuest v10.0 - Execution Agent: Get EDS
 * GET /api/agents/execution/eds/[profileId]
 *
 * Get Execution Debt Score for a profile.
 * EDS = Σ(missed_microsteps × days_delayed × difficulty_weight)
 *
 * Target: EDS < 50 (Huda benchmark: 12)
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

    // Proxy to agent service
    const response = await fetch(
      `${AGENT_SERVICE_URL}/agents/execution/eds/${profileId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[EDS] Error:', errorText);
      return NextResponse.json(
        { success: false, error: `Agent service error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('[EDS] Exception:', error);

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
