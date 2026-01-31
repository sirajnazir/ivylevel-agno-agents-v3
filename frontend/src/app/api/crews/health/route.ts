/**
 * CrewAI Health Check Route
 * Proxies to the backend /api/crews/health endpoint.
 */

import { NextResponse } from 'next/server';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const response = await fetch(`${AGENT_SERVICE_URL}/api/crews/health`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { status: 'error', message: 'Backend health check failed' },
      { status: response.status }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unreachable',
        message: 'Cannot reach agent backend',
        serviceUrl: AGENT_SERVICE_URL,
      },
      { status: 503 }
    );
  }
}
