import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin, getServerUser } from '@/lib/supabase-server';

export async function GET() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('*')
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { doctor_name, specialization, hospital, appointment_date, notes } = body;

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .insert({
      user_id: user.id,
      doctor_name,
      specialization,
      hospital,
      appointment_date,
      notes,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
