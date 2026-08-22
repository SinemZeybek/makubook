import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("auth_handoffs")
    .insert({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    })
    .select("token")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not create handoff" },
      { status: 500 }
    );
  }

  return NextResponse.json({ token: data.token });
}
