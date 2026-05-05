import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { supabase } from "@/lib/supabase";
import { getServerUser } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();

    // Whitelist allowed fields to update
    const allowedUpdates: any = {};
    if (updates.full_name) allowedUpdates.full_name = updates.full_name;
    if (updates.phone) allowedUpdates.phone = updates.phone; // Assuming there is a phone field or use emergency_contact
    if (updates.emergency_contact) allowedUpdates.emergency_contact = updates.emergency_contact;
    if (updates.blood_group) allowedUpdates.blood_group = updates.blood_group;
    if (updates.allergies) allowedUpdates.allergies = updates.allergies;
    if (updates.medical_conditions) allowedUpdates.medical_conditions = updates.medical_conditions;
    if (updates.country) allowedUpdates.country = updates.country;
    if (updates.language) allowedUpdates.language = updates.language;

    const { data, error } = await supabase
      .from('profiles')
      .update(allowedUpdates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
