import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('vital_signs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  // Only include fields with actual values
  const payload: Record<string, number | string> = { user_id: userId };
  const VITAL_KEYS = ['blood_pressure_systolic','blood_pressure_diastolic','heart_rate','blood_glucose','temperature','spo2','weight'];
  VITAL_KEYS.forEach(k => { if (body[k] !== undefined && body[k] !== '') payload[k] = parseFloat(body[k]); });

  const { data, error } = await supabaseAdmin
    .from('vital_signs')
    .insert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
