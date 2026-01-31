/**
 * IvyQuest v10.0 - Assessment Agent API Route
 * POST /api/agents/assessment/enhance
 *
 * Proxies to Python agent service for:
 * - Narrative DNA synthesis
 * - Archetype detection with confidence/rationale
 * - CRI computation
 * - Hidden probability matrix calculation
 */

import { NextRequest, NextResponse } from 'next/server';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, data } = body;

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
    const response = await fetch(`${AGENT_SERVICE_URL}/agents/assessment/enhance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile_id, data }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Assessment Agent] Error:', errorText);
      return NextResponse.json(
        { success: false, error: `Agent service error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('[Assessment Agent] Exception:', error);

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
