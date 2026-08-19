"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "../navbar";
import Footer from "../footer";

export default function ResetPasswordPage() {
  const t = useTranslations("ResetPassword");
  const searchParams = useSearchParams();
  const invalidLink = searchParams.get("error") === "invalid_link";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordsDontMatch"));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar userEmail={null} />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          {invalidLink ? (
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-berry">
                {t("invalidLinkHeading")}
              </h1>
              <p className="mt-4 text-berry/70">{t("invalidLinkBody")}</p>
              <Link
                href="/forgot-password"
                className="mt-4 inline-block text-sm text-berry underline"
              >
                {t("requestNewLink")}
              </Link>
            </div>
          ) : success ? (
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-berry">
                {t("successHeading")}
              </h1>
              <p className="mt-4 text-berry/70">{t("successBody")}</p>
              <button
                onClick={() => {
                  router.push("/");
                  router.refresh();
                }}
                className="mt-6 rounded-md bg-gold px-4 py-2 font-medium text-berry"
              >
                {t("continueToSite")}
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-center text-2xl font-semibold text-berry">
                {t("heading")}
              </h1>

              <form
                onSubmit={handleSubmit}
                className="mt-6 flex flex-col gap-4"
              >
                <input
                  type="password"
                  placeholder={t("newPasswordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
                />
                <input
                  type="password"
                  placeholder={t("confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-gold px-3 py-2 font-medium text-berry disabled:opacity-50"
                >
                  {loading ? t("saving") : t("save")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
