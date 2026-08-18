import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { title } = await request.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "editor") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data: recipe, error: updateError } = await supabase
    .from("recipes")
    .update({
      title: typeof title === "string" && title.trim() ? title.trim() : undefined,
      status: "published",
    })
    .eq("id", id)
    .select("id, title, author_id")
    .single();

  if (updateError || !recipe) {
    return NextResponse.json(
      { error: updateError?.message ?? "Could not approve recipe" },
      { status: 500 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (apiKey && serviceRoleKey) {
    try {
      const admin = createAdminClient();
      const { data: authorUser } = await admin.auth.admin.getUserById(
        recipe.author_id
      );
      const authorEmail = authorUser.user?.email;

      if (authorEmail) {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: "Makubook <onboarding@resend.dev>",
          to: authorEmail,
          subject: "Your recipe is live on Makubook!",
          text: `Good news — "${recipe.title}" has been reviewed and is now live on Makubook.\n\nView it here: ${siteUrl}/recipes/${recipe.id}\n\nThanks for sharing your recipe with the community!`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send recipe-approved email", emailError);
    }
  }

  return NextResponse.json({ success: true });
}
