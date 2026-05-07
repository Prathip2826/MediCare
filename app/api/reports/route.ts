import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET: list all reports for user
export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('medical_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST: save report metadata after upload
export async function POST(req: Request) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, file_type, file_url, file_path, report_type } = body;

  if (!file_url || !title) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('medical_reports')
    .insert({
      user_id: userId,
      title,
      file_type,
      file_url,
      file_path,
      report_type: report_type || 'Other',
      ai_summarized: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH: update report with AI summary
export async function PATCH(req: Request) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ai_summary, ai_summarized } = body;

  const { data, error } = await supabaseAdmin
    .from('medical_reports')
    .update({ ai_summary, ai_summarized, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE: remove report and its file
export async function DELETE(req: Request) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing report ID' }, { status: 400 });

  // Get file_path first so we can delete from storage
  const { data: report } = await supabaseAdmin
    .from('medical_reports')
    .select('file_path')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (report?.file_path) {
    await supabaseAdmin.storage.from('medical-reports').remove([report.file_path]);
  }

  const { error } = await supabaseAdmin
    .from('medical_reports')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
