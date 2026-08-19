"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "../navbar";
import Footer from "../footer";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar userEmail={null} />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-berry">
                {t("checkEmailHeading")}
              </h1>
              <p className="mt-4 text-berry/70">
                {t("checkEmailBody", { email })}
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-center text-2xl font-semibold text-berry">
                {t("heading")}
              </h1>
              <p className="mt-2 text-center text-sm text-berry/70">
                {t("body")}
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-6 flex flex-col gap-4"
              >
                <input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-gold px-3 py-2 font-medium text-berry disabled:opacity-50"
                >
                  {loading ? t("sending") : t("sendLink")}
                </button>
              </form>
            </>
          )}

          <Link
            href="/login"
            className="mt-4 block w-full text-center text-sm text-berry underline"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
