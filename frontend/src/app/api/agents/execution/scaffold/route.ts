/**
 * IvyQuest v10.0 - Execution Agent: Scaffold Project
 * POST /api/agents/execution/scaffold
 *
 * Breaks projects into microsteps with Strategic Overwhelm (ACP-004)
 * - Assigns 1.4x tasks
 * - Expects 73% completion rate
 * - Creates 20+ microsteps per project
 */

import { NextRequest, NextResponse } from 'next/server';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, project_data } = body;

    if (!profile_id) {
      return NextResponse.json(
        { success: false, error: 'profile_id is required' },
        { status: 400 }
      );
    }

    if (!project_data || !project_data.name) {
      return NextResponse.json(
        { success: false, error: 'project_data with name is required' },
        { status: 400 }
      );
    }

    // Check if execution agent is enabled
    if (process.env.ENABLE_EXECUTION_AGENT !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Execution Agent is disabled. Set ENABLE_EXECUTION_AGENT=true' },
        { status: 503 }
      );
    }

    // Proxy to agent service
    const response = await fetch(`${AGENT_SERVICE_URL}/agents/execution/scaffold`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile_id, project_data }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Execution Agent - Scaffold] Error:', errorText);
      return NextResponse.json(
        { success: false, error: `Agent service error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('[Execution Agent - Scaffold] Exception:', error);

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
