"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const router = useRouter();

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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, birthday } },
    });

    if (signUpError || !data.user) {
      const message =
        typeof signUpError?.message === "string" && signUpError.message
          ? signUpError.message
          : "Could not create account. Please check your email address and try again.";
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
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 block text-center font-logo text-2xl">
          <span className="text-gold">Maku</span>
          <span className="text-berry">book</span>
        </Link>

        {checkEmail ? (
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-berry">
              Check your email
            </h1>
            <p className="mt-4 text-berry/70">
              We've sent a confirmation link to <strong>{email}</strong>.
              Click it to activate your account, then come back and log in.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-center text-2xl font-semibold text-berry">
              {mode === "sign-in" ? "Log in" : "Sign up"}
            </h1>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
          />

          {mode === "sign-up" && (
            <>
              <input
                type="text"
                placeholder="Display name or nickname"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
              />
              <label className="flex flex-col gap-1 text-sm text-berry/70">
                Birthday
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  required
                  className="rounded-md border border-berry/20 px-3 py-2 text-berry"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-berry/70">
                Profile picture (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
                />
              </label>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-gold px-3 py-2 font-medium text-berry disabled:opacity-50"
          >
            {loading ? "..." : mode === "sign-in" ? "Log in" : "Sign up"}
          </button>
        </form>
          </>
        )}

        <button
          onClick={() => {
            setCheckEmail(false);
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          }}
          className="mt-4 block w-full text-center text-sm text-berry underline"
        >
          {checkEmail || mode === "sign-in"
            ? checkEmail
              ? "Back to log in"
              : "Need an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </div>
    </main>
  );
}
