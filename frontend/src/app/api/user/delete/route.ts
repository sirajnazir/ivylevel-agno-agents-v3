/**
 * DELETE /api/user/delete
 *
 * Server-side user data deletion with service role key (bypasses RLS).
 * Deletes ALL user data including profiles, assessments, conversations, etc.
 * Uses FK CASCADE from profiles table to clean child tables automatically.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: NextRequest) {
  try {
    // Get user ID from request body
    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const deletedCounts: Record<string, number> = {};

    console.log('[API/user/delete] Deleting all data for user:', userId);

    // 1. Delete from tables that use user_id (not cascaded from profiles)
    const userIdTables = ['assessments', 'weekly_vitals', 'student_items', 'timeline_events'];
    for (const table of userIdTables) {
      const { count, error } = await supabaseAdmin
        .from(table)
        .delete({ count: 'exact' })
        .eq('user_id', userId);

      if (error) {
        console.warn(`[API/user/delete] ${table} warning:`, error.message);
      }
      deletedCounts[table] = count ?? 0;
    }

    // 2. Delete from tables that use profile_id but might NOT cascade
    //    (in case FK cascade is not set up on all tables)
    const profileIdTables = [
      'nudge_queue', 'conversations', 'projects', 'weekly_plans',
      'agent_memories', 'crises', 'game_plans', 'notifications',
      'agent_state_versions',
    ];
    for (const table of profileIdTables) {
      const { count, error } = await supabaseAdmin
        .from(table)
        .delete({ count: 'exact' })
        .eq('profile_id', userId);

      if (error) {
        console.warn(`[API/user/delete] ${table} warning:`, error.message);
      }
      deletedCounts[table] = count ?? 0;
    }

    // 3. Delete the profile itself (this also CASCADE deletes any remaining child rows)
    const { count: profileCount, error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete({ count: 'exact' })
      .eq('user_id', userId);

    if (profileError) {
      console.error('[API/user/delete] profiles error:', profileError.message);
    }
    deletedCounts['profiles'] = profileCount ?? 0;

    console.log('[API/user/delete] Deleted counts:', deletedCounts);

    return NextResponse.json({
      success: true,
      deletedCounts,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API/user/delete] Exception:', errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
