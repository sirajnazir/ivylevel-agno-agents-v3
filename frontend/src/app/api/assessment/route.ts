/**
 * Assessment Persistence API
 * POST /api/assessment - Save an assessment
 * GET /api/assessment?session_id=xxx - Load an assessment by session ID
 * GET /api/assessment?user_id=xxx - Load assessments by user ID
 *
 * Updated for new beta schema (010_beta_complete_schema.sql)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { AssessmentInsert, AssessmentUpdate, Json } from '@/lib/supabase/database.types';
import type { StudentProfile } from '@/lib/types/student';

const ENABLE_PERSISTENCE = process.env.ENABLE_SUPABASE_PERSISTENCE === 'true';

export async function POST(request: NextRequest) {
  // Allow saving even if persistence is disabled (for development)
  // but log a warning
  if (!ENABLE_PERSISTENCE) {
    console.log('[Assessment API] Supabase persistence disabled, returning mock success');
    return NextResponse.json({
      success: true,
      persisted: false,
      message: 'Assessment accepted (persistence disabled)',
    });
  }

  try {
    const body = await request.json();
    const {
      session_id,
      user_id,
      profile,
      scores,
      completeness = 0,
      archetype,
    } = body as {
      session_id: string;
      user_id?: string;
      profile: StudentProfile;
      scores?: { aptitude: number; passion: number; community: number; identity: number; overall: number };
      completeness?: number;
      archetype?: string;
    };

    if (!session_id || !profile) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id, profile' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Build the scores object for storage
    const scoresJson: Json = scores ? {
      aptitude: scores.aptitude,
      passion: scores.passion,
      community: scores.community,
      identity: scores.identity,
      overall: scores.overall,
      ivy_ready_score: scores.overall,
    } : {
      aptitude: 0,
      passion: 0,
      community: 0,
      identity: 0,
      overall: 0,
      ivy_ready_score: 0,
    };

    // If user_id is provided, check for existing by user_id + session_id
    // Otherwise, check by session_id alone (anonymous user)
    let existing = null;
    if (user_id) {
      const { data } = await supabase
        .from('assessments')
        .select('id')
        .eq('user_id', user_id)
        .eq('session_id', session_id)
        .maybeSingle();
      existing = data;
    }

    const now = new Date().toISOString();

    if (existing) {
      // Update existing assessment
      const updateData: AssessmentUpdate = {
        profile_data: profile as unknown as Json,
        scores: scoresJson,
        completeness_score: completeness,
        archetype: archetype || null,
        completed_at: now,
      };

      const { error: updateError } = await supabase
        .from('assessments')
        .update(updateData)
        .eq('id', existing.id);

      if (updateError) {
        console.error('[Assessment API] Update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update assessment', details: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        persisted: true,
        action: 'updated',
        id: existing.id,
      });
    } else {
      // Insert new assessment - requires user_id in the new schema
      if (!user_id) {
        // For anonymous users, we can't save to the new schema
        // Return a soft failure that allows the app to continue
        console.log('[Assessment API] No user_id provided, cannot save to new schema');
        return NextResponse.json({
          success: true,
          persisted: false,
          message: 'Assessment accepted but not persisted (no user_id)',
        });
      }

      const insertData: AssessmentInsert = {
        user_id,
        session_id,
        profile_data: profile as unknown as Json,
        scores: scoresJson,
        completeness_score: completeness,
        archetype: archetype || null,
        completed_at: now,
      };

      const { data: newAssessment, error: insertError } = await supabase
        .from('assessments')
        .insert(insertData)
        .select('id')
        .single();

      if (insertError) {
        console.error('[Assessment API] Insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to save assessment', details: insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        persisted: true,
        action: 'created',
        id: newAssessment.id,
      });
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Assessment API] POST error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!ENABLE_PERSISTENCE) {
    return NextResponse.json({
      success: false,
      persisted: false,
      message: 'Supabase persistence disabled',
      data: null,
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');
    const user_id = searchParams.get('user_id');

    if (!session_id && !user_id) {
      return NextResponse.json(
        { error: 'Missing query parameter: session_id or user_id required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    if (session_id && user_id) {
      // Fetch by user_id + session_id (specific assessment)
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user_id)
        .eq('session_id', session_id)
        .maybeSingle();

      if (error) {
        console.error('[Assessment API] GET error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch assessment', details: error.message },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json({
          success: true,
          found: false,
          data: null,
        });
      }

      return NextResponse.json({
        success: true,
        found: true,
        data: {
          ...data,
          profile: data.profile_data,
        },
      });
    }

    if (user_id) {
      // Fetch all assessments by user_id
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Assessment API] GET error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch assessments', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        found: (data?.length ?? 0) > 0,
        count: data?.length ?? 0,
        data: (data ?? []).map((item) => ({
          ...item,
          profile: item.profile_data,
        })),
      });
    }

    if (session_id) {
      // Fetch by session ID (single assessment) - for backward compatibility
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('session_id', session_id)
        .maybeSingle();

      if (error) {
        console.error('[Assessment API] GET error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch assessment', details: error.message },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json({
          success: true,
          found: false,
          data: null,
        });
      }

      return NextResponse.json({
        success: true,
        found: true,
        data: {
          ...data,
          profile: data.profile_data,
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid query parameters',
    }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Assessment API] GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: err.message },
      { status: 500 }
    );
  }
}
