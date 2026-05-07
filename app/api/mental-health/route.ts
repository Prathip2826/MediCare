import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Mental health fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch mood logs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { mood_score, mood_label, notes } = await req.json();

    const { data, error } = await supabaseAdmin
      .from('mood_logs')
      .insert([{
        user_id: userId,
        mood_score,
        mood_label,
        notes,
        logged_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Mental health post error:", error);
    return NextResponse.json({ error: "Failed to save mood log" }, { status: 500 });
  }
}
