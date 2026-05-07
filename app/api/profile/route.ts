import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: Request) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // PGRST116 = row not found — return empty object so frontend knows user exists but no profile yet
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || {});
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();

    // Build the upsert payload — allow all valid profile fields
    const payload: Record<string, any> = { id: userId, updated_at: new Date().toISOString() };
    const ALLOWED = [
      'full_name', 'date_of_birth', 'gender', 'blood_type',
      'height_cm', 'weight_kg', 'allergies', 'medical_conditions',
      'emergency_contact_name', 'emergency_contact_phone', 'avatar_url',
    ];
    for (const key of ALLOWED) {
      if (key in updates) payload[key] = updates[key];
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all user data across tables
    await Promise.allSettled([
      supabaseAdmin.from('profiles').delete().eq('id', userId),
      supabaseAdmin.from('medicines').delete().eq('user_id', userId),
      supabaseAdmin.from('appointments').delete().eq('user_id', userId),
      supabaseAdmin.from('nutrition_logs').delete().eq('user_id', userId),
      supabaseAdmin.from('vital_signs').delete().eq('user_id', userId),
      supabaseAdmin.from('wellness_logs').delete().eq('user_id', userId),
      supabaseAdmin.from('fitness_logs').delete().eq('user_id', userId),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete account data' }, { status: 500 });
  }
}
