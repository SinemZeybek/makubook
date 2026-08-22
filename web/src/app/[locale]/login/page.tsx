"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "../navbar";
import Footer from "../footer";
import AvatarPicker from "../avatar-picker";

export default function LoginPage() {
  const t = useTranslations("Login");
  const searchParams = useSearchParams();
  const urlMode = searchParams.get("mode") === "sign-up" ? "sign-up" : "sign-in";
  const [mode, setMode] = useState<"sign-in" | "sign-up">(urlMode);
  // Tracks the URL-derived mode we last synced to, so a change in the URL
  // (e.g. clicking the navbar's "Sign up" link while already on this page)
  // is picked up without an effect — adjusting state during render is the
  // React-sanctioned way to do this, unlike calling setState in an effect.
  const [lastUrlMode, setLastUrlMode] = useState(urlMode);
  if (urlMode !== lastUrlMode) {
    setLastUrlMode(urlMode);
    setMode(urlMode);
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const router = useRouter();

  function handleAvatarChange(file: File | null) {
    setAvatar(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleGoogleSignIn() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    if (!agreedToTerms) {
      setError(t("agreeToTermsRequired"));
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, birthday } },
    });

    if (signUpError || !data.user) {
      const message =
        typeof signUpError?.message === "string" && signUpError.message
          ? signUpError.message
          : t("signUpError");
      setError(message);
      setLoading(false);
      return;
    }

    if (avatar) {
      const extension = avatar.name.split(".").pop();
      const path = `${data.user.id}/avatar.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatar, { upsert: true });

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(path);

        await supabase
          .from("profiles")
          .update({ avatar_url: publicUrl })
          .eq("id", data.user.id);
      }
    }

    setLoading(false);

    if (!data.session) {
      setCheckEmail(true);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar userEmail={null} />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        {checkEmail ? (
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-berry">
              {t("checkEmailHeading")}
            </h1>
            <p className="mt-4 text-berry/70">
              {t("checkEmailPrefix")} <strong>{email}</strong>.{" "}
              {t("checkEmailSuffix")}
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-center text-2xl font-semibold text-berry">
              {mode === "sign-in" ? t("logIn") : t("signUp")}
            </h1>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
          />
          <input
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
          />

          {mode === "sign-in" && (
            <Link
              href="/forgot-password"
              className="-mt-2 self-end text-xs text-berry underline"
            >
              {t("forgotPassword")}
            </Link>
          )}

          {mode === "sign-up" && (
            <>
              <input
                type="text"
                placeholder={t("displayNamePlaceholder")}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
              />
              <label className="flex flex-col gap-1 text-sm text-berry/70">
                {t("birthday")}
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  required
                  className="rounded-md border border-berry/20 px-3 py-2 text-berry"
                />
              </label>
              <div className="flex items-center gap-4">
                <AvatarPicker
                  preview={avatarPreview}
                  onChange={handleAvatarChange}
                  label={t("profilePictureOptional")}
                />
                <p className="text-sm text-berry/60">
                  {t("profilePictureOptional")}
                </p>
              </div>
              <label className="flex items-start gap-2 text-sm text-berry/70">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                  className="mt-1"
                />
                <span>
                  {t("agreeToTerms")}{" "}
                  <Link href="/terms" target="_blank" className="text-berry underline">
                    {t("termsOfService")}
                  </Link>{" "}
                  {t("and")}{" "}
                  <Link href="/privacy" target="_blank" className="text-berry underline">
                    {t("privacyPolicy")}
                  </Link>
                </span>
              </label>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-gold px-3 py-2 font-medium text-berry disabled:opacity-50"
          >
            {loading ? "..." : mode === "sign-in" ? t("logIn") : t("signUp")}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3 text-xs text-berry/40">
          <div className="h-px flex-1 bg-berry/15" />
          {t("or")}
          <div className="h-px flex-1 bg-berry/15" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={mode === "sign-up" && !agreedToTerms}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-berry/20 px-3 py-2 font-medium text-berry disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            />
          </svg>
          {t("continueWithGoogle")}
        </button>
        {mode === "sign-up" && !agreedToTerms && (
          <p className="mt-1 text-center text-xs text-berry/50">
            {t("agreeToTermsRequired")}
          </p>
        )}
          </>
        )}

        <button
          onClick={() => {
            setCheckEmail(false);
            const nextMode = mode === "sign-in" ? "sign-up" : "sign-in";
            router.replace(
              nextMode === "sign-up" ? "/login?mode=sign-up" : "/login"
            );
            setMode(nextMode);
          }}
          className="mt-4 block w-full text-center text-sm text-berry underline"
        >
          {checkEmail || mode === "sign-in"
            ? checkEmail
              ? t("backToLogin")
              : t("needAccount")
            : t("alreadyHaveAccount")}
        </button>
      </div>
      </div>

      <Footer />
    </main>
  );
}
