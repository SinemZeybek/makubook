"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteRecipeButton({
  recipeId,
}: {
  recipeId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("Delete this recipe? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    const supabase = createClient();
    await supabase.from("recipes").delete().eq("id", recipeId);
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-md bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete recipe"}
    </button>
  );
}
