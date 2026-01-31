/**
 * IvyQuest v10.0 - Execution Agent: Crisis Alchemy
 * POST /api/agents/execution/crisis
 *
 * Executes 4-step Crisis Alchemy Protocol via LangGraph (ACP-003):
 * 1. Validate (2s) - Acknowledge emotion immediately
 * 2. Act (10s) - One concrete micro-action to restore agency
 * 3. Reframe (30s) - Find the opportunity angle
 * 4. Create (2min) - Design new activity/pivot
 *
 * CRITICAL: Uses LangGraph (NOT AutoGen) per v9.1 correction
 * Returns: Proposed response awaiting HITL approval (<1hr)
 *
 * Huda Benchmark: <72 hours recovery (Huda actual: <2 hours)
 */

import { NextRequest, NextResponse } from 'next/server';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, crisis_type, description, urgency } = body;

    if (!profile_id) {
      return NextResponse.json(
        { success: false, error: 'profile_id is required' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'description is required' },
        { status: 400 }
      );
    }

    // Check if crisis alchemy is enabled
    if (process.env.ENABLE_CRISIS_ALCHEMY !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Crisis Alchemy is disabled. Set ENABLE_CRISIS_ALCHEMY=true' },
        { status: 503 }
      );
    }

    // Proxy to agent service
    const response = await fetch(`${AGENT_SERVICE_URL}/agents/execution/crisis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile_id,
        crisis_type: crisis_type || 'blocker',
        description,
        urgency: urgency || 3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Crisis Alchemy] Error:', errorText);
      return NextResponse.json(
        { success: false, error: `Agent service error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Log crisis for monitoring
    console.log('[Crisis Alchemy] Crisis processed:', {
      profile_id,
      crisis_id: result.crisis_id,
      status: result.status,
      requires_approval: result.requires_human_approval,
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('[Crisis Alchemy] Exception:', error);

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
