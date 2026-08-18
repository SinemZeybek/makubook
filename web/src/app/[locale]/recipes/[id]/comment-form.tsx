"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CommentForm({ recipeId }: { recipeId: string }) {
  const [body, setBody] = useState("");
  const [rating, setRating] = useState("5");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to comment.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("comments").insert({
      recipe_id: recipeId,
      user_id: user.id,
      body,
      rating: Number(rating),
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className="w-32 rounded-md border border-berry/20 px-3 py-2 text-berry"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {"★".repeat(n)}
            {"☆".repeat(5 - n)}
          </option>
        ))}
      </select>

      <textarea
        placeholder="What did you think? Any changes you made?"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={3}
        className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-md bg-gold px-3 py-2 text-sm font-medium text-berry disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post comment"}
      </button>
    </form>
  );
}
