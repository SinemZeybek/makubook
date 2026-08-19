"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function CommentHelpfulButton({
  commentId,
  userId,
  initialVoted,
  initialHelpfulCount,
}: {
  commentId: string;
  userId: string;
  initialVoted: boolean;
  initialHelpfulCount: number;
}) {
  const t = useTranslations("Comment");
  const [voted, setVoted] = useState(initialVoted);
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const supabase = createClient();

    if (voted) {
      const { error } = await supabase
        .from("comment_helpful_votes")
        .delete()
        .eq("user_id", userId)
        .eq("comment_id", commentId);
      if (!error) {
        setVoted(false);
        setHelpfulCount((count) => Math.max(count - 1, 0));
      }
    } else {
      const { error } = await supabase
        .from("comment_helpful_votes")
        .insert({ user_id: userId, comment_id: commentId });
      if (!error) {
        setVoted(true);
        setHelpfulCount((count) => count + 1);
      }
    }

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={voted}
      aria-label={voted ? t("removeHelpfulAria") : t("helpfulAria")}
      className={`flex items-center gap-1.5 text-xs disabled:opacity-50 ${
        voted ? "text-berry" : "text-berry/50 hover:text-berry"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={voted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 10v12" />
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
      </svg>
      {t("helpful")}
      {helpfulCount > 0 && ` (${helpfulCount})`}
    </button>
  );
}
