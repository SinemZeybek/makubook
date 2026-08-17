import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../../navbar";
import RecipeCard from "../../recipe-card";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    notFound();
  }

  const { data: recipes } = await supabase
    .from("recipes")
    .select(
      "id, title, description, country, meal_type, language, author_id, recipe_images(url), profiles(display_name, avatar_url)"
    )
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  const isOwnProfile = user?.id === userId;

  let savedRecipeIds = new Set<string>();
  if (user) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("recipe_id")
      .eq("user_id", user.id);
    savedRecipeIds = new Set(favorites?.map((f) => f.recipe_id));
  }

  return (
    <main className="min-h-screen bg-cream">
      <Navbar userEmail={user?.email ?? null} userId={user?.id ?? null} />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-berry/10">
              <Image
                src={profile.avatar_url || "/default-avatar.png"}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-berry">
                {profile.display_name ?? "Anonymous"}
              </h1>
              <p className="text-sm text-berry/60">
                {recipes?.length ?? 0} recipe
                {recipes?.length === 1 ? "" : "s"} shared
              </p>
            </div>
          </div>

          {isOwnProfile && (
            <div className="flex gap-2">
              <Link
                href="/profile/edit"
                className="rounded-md border border-berry/20 px-4 py-2 text-sm text-berry hover:bg-berry/10"
              >
                Edit profile
              </Link>
              <Link
                href="/saved"
                className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-berry"
              >
                Saved recipes
              </Link>
            </div>
          )}
        </div>

        <div className="mt-10">
          {recipes && recipes.length > 0 ? (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <li key={recipe.id}>
                  <RecipeCard
                    recipe={recipe}
                    currentUserId={user?.id ?? null}
                    initialSaved={savedRecipeIds.has(recipe.id)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-berry/70">
              {isOwnProfile
                ? "You haven't shared any recipes yet."
                : "This user hasn't shared any recipes yet."}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
