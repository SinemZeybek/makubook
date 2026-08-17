import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../navbar";
import Footer from "../footer";
import EditorQueueItem from "./editor-queue-item";

export default async function EditorQueuePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "editor") {
    redirect("/");
  }

  const { data: pendingRecipes } = await supabase
    .from("recipes")
    .select(
      "id, title, description, country, meal_type, language, author_id, recipe_images(url), profiles(display_name, avatar_url)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar userEmail={user.email ?? null} userId={user.id} isEditor />

      <div className="flex-1 mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-berry">
          Editor queue
        </h1>
        <p className="mt-1 text-sm text-berry/60">
          {pendingRecipes?.length ?? 0} recipe
          {pendingRecipes?.length === 1 ? "" : "s"} waiting for review.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {pendingRecipes && pendingRecipes.length > 0 ? (
            pendingRecipes.map((recipe) => (
              <EditorQueueItem key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <p className="text-berry/70">Nothing waiting for review.</p>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
