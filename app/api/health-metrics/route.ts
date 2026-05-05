import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { supabaseAdmin, getServerUser } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    let query = supabaseAdmin
      .from('health_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false });

    if (type) {
      query = query.eq('metric_type', type);
    }

    const { data, error } = await query.limit(30);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Health metrics fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch health metrics" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { metric_type, value, unit } = await req.json();

    const { data, error } = await supabaseAdmin
      .from('health_metrics')
      .insert([
        { 
          user_id: user.id, 
          metric_type, 
          value, 
          unit,
          recorded_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Health metrics post error:", error);
    return NextResponse.json({ error: "Failed to save health metric" }, { status: 500 });
  }
}
