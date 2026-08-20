import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderEmail } from "@/lib/emailTemplate";

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  const { name, email, message, company } = await request.json();

  // Honeypot: real users never fill this hidden field. Pretend success so
  // bots don't learn to adjust their approach.
  if (typeof company === "string" && company.trim()) {
    return NextResponse.json({ ok: true });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return NextResponse.json(
      { error: "Name, email, and message are all required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;

  if (!apiKey || !contactEmail) {
    return NextResponse.json(
      { error: "Contact form is not configured yet." },
      { status: 500 }
    );
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (serviceRoleKey) {
    const admin = createAdminClient();
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count } = await admin
      .from("contact_rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", since);

    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Too many messages sent. Please try again later." },
        { status: 429 }
      );
    }

    await admin.from("contact_rate_limits").insert({ ip_address: ip });
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Makubook Contact Form <noreply@makubook.com>",
    to: contactEmail,
    replyTo: email,
    subject: `New message from ${name} via Makubook`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: renderEmail({
      heading: "New contact form message",
      bodyHtml: `<p style="margin:0 0 12px;"><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p style="margin:0;white-space:pre-line;">${escapeHtml(message)}</p>`,
    }),
  });

  if (error) {
    return NextResponse.json(
      { error: "Could not send message. Please try again later." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
