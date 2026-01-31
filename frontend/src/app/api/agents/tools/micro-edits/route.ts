import { NextRequest, NextResponse } from 'next/server';

const AGENT_API_URL = process.env.AGENT_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${AGENT_API_URL}/tools/micro-edits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ success: false, error: data.detail || data.error }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
