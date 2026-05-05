import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin, getServerUser } from '@/lib/supabase-server';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const medicineId = searchParams.get('medicine_id');
  const today = searchParams.get('today') === 'true';

  let query = supabaseAdmin
    .from('medicine_logs')
    .select('*')
    .eq('user_id', user.id);

  if (medicineId) {
    query = query.eq('medicine_id', medicineId);
  }

  if (today) {
    const start = startOfDay(new Date()).toISOString();
    const end = endOfDay(new Date()).toISOString();
    query = query.gte('taken_at', start).lte('taken_at', end);
  }

  const { data, error } = await query.order('taken_at', { ascending: false });

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
  const { medicine_id, status = 'taken' } = body;

  if (!medicine_id) {
    return NextResponse.json({ error: 'Missing medicine ID' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('medicine_logs')
    .insert({
      user_id: user.id,
      medicine_id,
      status,
      taken_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
