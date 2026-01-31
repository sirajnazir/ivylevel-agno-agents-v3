/**
 * Agent API Route
 * Proxies requests to the Python agent backend service.
 * @version 10.0
 */

import { NextRequest, NextResponse } from 'next/server';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';
const AGENT_TIMEOUT = parseInt(process.env.AGENT_API_TIMEOUT || '30000');

// Valid agent types
const VALID_AGENTS = [
  'assessment',
  'execution',
  'gameplan',
  'crisis',
  'cri',
  'narrative',
  'awards',
  'opportunity',
  'chat',
];

export async function POST(
  request: NextRequest,
  { params }: { params: { agentType: string } }
) {
  const { agentType } = params;

  // Validate agent type
  if (!VALID_AGENTS.includes(agentType)) {
    return NextResponse.json(
      { success: false, error: `Invalid agent type: ${agentType}` },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID();

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AGENT_TIMEOUT);

    try {
      const response = await fetch(`${AGENT_SERVICE_URL}/agents/${agentType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (response.ok) {
        return NextResponse.json({
          success: true,
          data: result.data || result,
          timestamp: new Date().toISOString(),
          requestId,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.error || result.detail || 'Agent request failed',
            requestId,
          },
          { status: response.status }
        );
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Request timeout', requestId },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error(`Agent API error (${agentType}):`, error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: { agentType: string } }
) {
  const { agentType } = params;

  if (!VALID_AGENTS.includes(agentType)) {
    return NextResponse.json(
      { valid: false, agent: agentType },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${AGENT_SERVICE_URL}/health`, {
      method: 'GET',
    });

    const healthy = response.ok;

    return NextResponse.json({
      agent: agentType,
      valid: true,
      serviceHealthy: healthy,
      serviceUrl: AGENT_SERVICE_URL,
    });
  } catch {
    return NextResponse.json({
      agent: agentType,
      valid: true,
      serviceHealthy: false,
      serviceUrl: AGENT_SERVICE_URL,
    });
  }
}
