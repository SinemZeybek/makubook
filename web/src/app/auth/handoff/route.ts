import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_AGE_SECONDS = 60;

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const nextParam = searchParams.get("next") ?? "/";
  const next = nextParam.startsWith("/") ? nextParam : "/";

  if (!token) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("auth_handoffs")
    .delete()
    .eq("token", token)
    .select("access_token, refresh_token, created_at")
    .single();

  if (!row) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const ageSeconds = (Date.now() - new Date(row.created_at).getTime()) / 1000;
  if (ageSeconds > MAX_AGE_SECONDS) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const supabase = await createClient();
  await supabase.auth.setSession({
    access_token: row.access_token,
    refresh_token: row.refresh_token,
  });

  return NextResponse.redirect(`${origin}${next}`);
}
