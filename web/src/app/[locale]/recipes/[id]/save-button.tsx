"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function SaveButton({
  recipeId,
  userId,
  initialSaved,
  initialLikeCount = 0,
}: {
  recipeId: string;
  userId: string;
  initialSaved: boolean;
  initialLikeCount?: number;
}) {
  const t = useTranslations("Save");
  const [saved, setSaved] = useState(initialSaved);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
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
        setLikeCount((count) => Math.max(count - 1, 0));
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, recipe_id: recipeId });
      if (!error) {
        setSaved(true);
        setLikeCount((count) => count + 1);
      }
    }

    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        disabled={loading}
        aria-pressed={saved}
        aria-label={saved ? t("removeSavedAria") : t("aria")}
        className="flex items-center gap-1.5 text-sm text-berry underline underline-offset-2 disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
        </svg>
        {saved ? t("savedLabel") : t("label")}
      </button>
      <span className="text-sm text-berry/60">
        {t("likeCount", { count: likeCount })}
      </span>
    </div>
  );
}
