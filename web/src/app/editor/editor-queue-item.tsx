"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  country: string | null;
  meal_type: string | null;
  language: string;
  author_id: string;
  recipe_images: { url: string }[] | null;
  profiles: { display_name: string | null; avatar_url: string | null } | null;
};

export default function EditorQueueItem({ recipe }: { recipe: Recipe }) {
  const [title, setTitle] = useState(recipe.title);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function updateStatus(status: "published" | "rejected") {
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("recipes")
      .update({ title: title.trim(), status })
      .eq("id", recipe.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-berry/15 bg-white p-4 sm:flex-row">
      <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-md bg-berry/5 sm:w-32">
        {recipe.recipe_images?.[0]?.url && (
          <Image
            src={recipe.recipe_images[0].url}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-berry/60">
          <div className="relative h-4 w-4 overflow-hidden rounded-full">
            <Image
              src={recipe.profiles?.avatar_url || "/default-avatar.png"}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <span>{recipe.profiles?.display_name ?? "Anonymous"}</span>
          {recipe.country && <span>· {recipe.country}</span>}
          {recipe.meal_type && <span>· {recipe.meal_type}</span>}
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border border-berry/20 px-3 py-2 font-medium text-berry"
        />

        {recipe.description && (
          <p className="text-sm text-berry/70">{recipe.description}</p>
        )}

        <Link
          href={`/recipes/${recipe.id}`}
          className="text-sm text-berry underline"
        >
          View full recipe
        </Link>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="mt-1 flex gap-2">
          <button
            type="button"
            disabled={loading || !title.trim()}
            onClick={() => updateStatus("published")}
            className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-berry disabled:opacity-50"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => updateStatus("rejected")}
            className="rounded-md border border-red-600/30 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-600/10 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
