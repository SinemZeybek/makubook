"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SaveToggleButton({
  recipeId,
  userId,
  initialSaved,
}: {
  recipeId: string;
  userId: string | null;
  initialSaved: boolean;
}) {
  const t = useTranslations("Save");
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(message: string) {
    setToast(message);
    setToastVisible(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setToastVisible(true));
    });
    setTimeout(() => setToastVisible(false), 1500);
    setTimeout(() => setToast(null), 1800);
  }

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation();

    if (!userId) {
      setShowLoginPrompt(true);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (saved) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("recipe_id", recipeId);
      if (!error) {
        setSaved(false);
        showToast(t("removedToast"));
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, recipe_id: recipeId });
      if (!error) {
        setSaved(true);
        showToast(t("savedToast"));
      }
    }

    setLoading(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={saved}
        aria-label={saved ? t("removeSavedAria") : t("aria")}
        className="pointer-events-auto absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 text-berry shadow-sm hover:bg-cream disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
        </svg>
      </button>

      {toast && (
        <div
          className={`pointer-events-none absolute right-2 top-12 z-20 whitespace-nowrap rounded-md bg-berry px-3 py-1.5 text-xs text-cream shadow-md transition-opacity duration-300 ${
            toastVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {toast}
        </div>
      )}

      {showLoginPrompt && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowLoginPrompt(false);
          }}
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-berry/40 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto w-full max-w-sm rounded-lg bg-cream p-6 text-center shadow-lg"
          >
            <p className="text-berry">{t("loginRequired")}</p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLoginPrompt(false);
                }}
                className="rounded-md border border-berry/20 px-4 py-2 text-sm text-berry hover:bg-berry/10"
              >
                {t("cancel")}
              </button>
              <Link
                href="/login"
                className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-berry"
              >
                {t("logIn")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
