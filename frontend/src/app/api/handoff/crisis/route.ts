/**
 * IvyQuest v10.0 - HITL Handoff: Crisis Approval
 * POST /api/handoff/crisis
 *
 * Human-in-the-Loop approval for Crisis Alchemy responses.
 * Per spec: Coach must approve within 1 hour.
 *
 * Human Shadow Mode:
 * - Agent proposes response
 * - Coach reviews and approves/rejects
 * - If approved: Execute response
 * - If rejected: Escalate for manual handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';

// Create Supabase admin client for logging
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { crisis_id, approved, rationale, approved_by } = body;

    if (!crisis_id) {
      return NextResponse.json(
        { success: false, error: 'crisis_id is required' },
        { status: 400 }
      );
    }

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'approved (boolean) is required' },
        { status: 400 }
      );
    }

    // Log the handoff decision for audit
    console.log('[HITL Handoff] Processing:', {
      crisis_id,
      approved,
      approved_by: approved_by || 'anonymous_coach',
      timestamp: new Date().toISOString(),
    });

    // Proxy to agent service
    const response = await fetch(`${AGENT_SERVICE_URL}/agents/handoff/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        crisis_id,
        approved,
        rationale: rationale || (approved ? 'Approved by coach' : 'Rejected by coach'),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[HITL Handoff] Error:', errorText);
      return NextResponse.json(
        { success: false, error: `Agent service error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Log human override for state versioning
    try {
      // Get crisis to find profile_id
      const { data: crisis } = await supabase
        .from('crises')
        .select('profile_id')
        .eq('id', crisis_id)
        .single();

      if (crisis) {
        // Log to agent_state_versions with created_by='human'
        await supabase.from('agent_state_versions').insert({
          profile_id: crisis.profile_id,
          agent: 'Execution',
          state: { crisis_id, approved, rationale },
          version: 999, // Will be replaced by DB function
          created_by: 'human',
          event_type: 'HUMAN_OVERRIDE',
          rationale: rationale || `Crisis ${approved ? 'approved' : 'rejected'} by coach`,
        });
      }
    } catch (dbError) {
      console.error('[HITL Handoff] DB logging error:', dbError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      ...result,
      logged: true,
    });

  } catch (error) {
    console.error('[HITL Handoff] Exception:', error);

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

// GET: List pending approvals
export async function GET(request: NextRequest) {
  try {
    // Get pending crisis approvals from database
    const { data, error } = await supabase
      .from('crises')
      .select(`
        id,
        profile_id,
        type,
        title,
        description,
        urgency,
        proposed_response,
        approval_deadline,
        created_at
      `)
      .eq('status', 'proposed')
      .eq('requires_human_approval', true)
      .order('approval_deadline', { ascending: true });

    if (error) {
      console.error('[HITL Handoff] DB error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Calculate time remaining for each
    const pendingApprovals = (data || []).map((crisis) => {
      const deadline = new Date(crisis.approval_deadline);
      const now = new Date();
      const minutesRemaining = Math.max(0, (deadline.getTime() - now.getTime()) / 60000);

      return {
        ...crisis,
        minutes_until_deadline: Math.round(minutesRemaining),
        is_urgent: minutesRemaining < 30,
        is_expired: minutesRemaining <= 0,
      };
    });

    return NextResponse.json({
      success: true,
      pending_count: pendingApprovals.length,
      approvals: pendingApprovals,
    });

  } catch (error) {
    console.error('[HITL Handoff] GET Exception:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
