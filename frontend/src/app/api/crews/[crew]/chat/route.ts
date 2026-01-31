/**
 * CrewAI Chat API Route
 * Proxies requests to the Python CrewAI backend endpoints.
 * Each crew is feature-flagged on the backend — disabled crews return legacy responses.
 */

import { NextRequest, NextResponse } from 'next/server';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';
const AGENT_TIMEOUT = parseInt(process.env.AGENT_API_TIMEOUT || '60000');

const VALID_CREWS = [
  'execution',
  'academic',
  'ec',
  'awards',
  'programs',
  'assessment',
  'gameplan',
];

export async function POST(
  request: NextRequest,
  { params }: { params: { crew: string } }
) {
  const { crew } = params;

  if (!VALID_CREWS.includes(crew)) {
    return NextResponse.json(
      { success: false, error: `Invalid crew: ${crew}` },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AGENT_TIMEOUT);

    try {
      const response = await fetch(`${AGENT_SERVICE_URL}/api/crews/${crew}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        body: JSON.stringify({
          profile_id: body.profile_id,
          message: body.message,
          conversation_id: body.conversation_id,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (response.ok) {
        return NextResponse.json({
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
          requestId,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.detail || 'Crew request failed',
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
    console.error(`Crew API error (${crew}):`, error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
