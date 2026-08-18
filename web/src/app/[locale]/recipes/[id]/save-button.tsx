"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SaveButton({
  recipeId,
  userId,
  initialSaved,
}: {
  recipeId: string;
  userId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
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
      if (!error) setSaved(false);
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, recipe_id: recipeId });
      if (!error) setSaved(true);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved recipes" : "Save recipe"}
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
        <path d="M6 3.5h12a.5.5 0 0 1 .5.5v17l-6.5-4-6.5 4V4a.5.5 0 0 1 .5-.5Z" />
      </svg>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
