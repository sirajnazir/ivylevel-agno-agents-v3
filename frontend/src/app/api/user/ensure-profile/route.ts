/**
 * POST /api/user/ensure-profile
 *
 * Server-side profile creation with service role key (bypasses RLS).
 * Creates a profiles row if one doesn't exist for the given user.
 *
 * This is the FOUNDATIONAL fix for the profile lifecycle bug:
 * All agent systems depend on profiles row existing, but no code ever created it.
 *
 * Uses UPSERT with onConflict: 'id' to be idempotent:
 * - First call: creates the row with all available data
 * - Subsequent calls: no-op (ignoreDuplicates prevents overwrites)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface EnsureProfileBody {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  grade?: number | null;
  graduationYear?: number | null;
  highSchool?: string | null;
  targetMajor?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: EnsureProfileBody = await request.json();
    const { userId, email, firstName, lastName, grade, graduationYear, highSchool, targetMajor } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { success: false, error: 'userId and email are required' },
        { status: 400 }
      );
    }

    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if profile already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('[API/ensure-profile] Check error:', checkError.message);
      return NextResponse.json(
        { success: false, error: checkError.message },
        { status: 500 }
      );
    }

    if (existing) {
      // Profile already exists - no-op
      console.log('[API/ensure-profile] Profile already exists for:', userId);
      return NextResponse.json({
        success: true,
        profileId: userId,
        created: false,
      });
    }

    // Profile doesn't exist - create it
    const insertData = {
      id: userId,
      email,
      role: 'student' as const,
      first_name: firstName || null,
      last_name: lastName || null,
      grade: grade || null,
      graduation_year: graduationYear || null,
      high_school: highSchool || null,
      target_major: targetMajor || null,
      onboarding_completed: true,
      onboarding_step: 6,
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert(insertData)
      .select('id')
      .single();

    if (insertError) {
      // Handle race condition: another request may have created it
      if (insertError.code === '23505') {
        // Unique violation - row was created by concurrent request
        console.log('[API/ensure-profile] Concurrent creation, profile exists:', userId);
        return NextResponse.json({
          success: true,
          profileId: userId,
          created: false,
        });
      }

      console.error('[API/ensure-profile] Insert error:', insertError.message);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    console.log('[API/ensure-profile] Profile created:', data.id);
    return NextResponse.json({
      success: true,
      profileId: data.id,
      created: true,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API/ensure-profile] Exception:', errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
