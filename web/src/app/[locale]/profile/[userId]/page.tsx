import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../../navbar";
import Footer from "../../footer";
import RecipeCard from "../../recipe-card";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const t = await getTranslations("Profile");
  const tCommon = await getTranslations("Common");
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
      "id, title, description, country, meal_type, language, author_id, status, recipe_images(url), profiles(display_name, avatar_url)"
    )
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  const isOwnProfile = user?.id === userId;

  let savedRecipeIds = new Set<string>();
  let isEditor = false;
  if (user) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("recipe_id")
      .eq("user_id", user.id);
    savedRecipeIds = new Set(favorites?.map((f) => f.recipe_id));

    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isEditor = viewerProfile?.role === "editor";
  }

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar
        userEmail={user?.email ?? null}
        userId={user?.id ?? null}
        isEditor={isEditor}
      />

      <div className="flex-1 mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-berry/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-berry/10 ring-2 ring-gold ring-offset-2 ring-offset-white">
              <Image
                src={profile.avatar_url || "/default-avatar.png"}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-berry">
                {profile.display_name ?? tCommon("anonymous")}
              </h1>
              <p className="text-sm text-berry/60">
                {t("recipesSharedCount", { count: recipes?.length ?? 0 })}
              </p>
            </div>
          </div>

          {isOwnProfile && (
            <div className="flex gap-2">
              <Link
                href="/profile/edit"
                className="flex items-center gap-1.5 rounded-full border border-berry/20 px-4 py-2 text-sm font-medium text-berry transition-all duration-200 hover:-translate-y-0.5 hover:bg-berry/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                {t("editProfile")}
              </Link>
              <Link
                href="/saved"
                className="flex items-center gap-1.5 rounded-full border border-gold bg-gold/25 px-4 py-2 text-sm font-medium text-berry shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold/45 hover:shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 3.5h12a.5.5 0 0 1 .5.5v17l-6.5-4-6.5 4V4a.5.5 0 0 1 .5-.5Z" />
                </svg>
                {t("savedRecipes")}
              </Link>
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-berry">
            {isOwnProfile
              ? t("myRecipes")
              : t("theirRecipes", {
                  name: profile.display_name ?? tCommon("anonymous"),
                })}
          </h2>
          {recipes && recipes.length > 0 ? (
            <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <p className="mt-4 text-berry/70">
              {isOwnProfile ? t("noRecipesOwn") : t("noRecipesOther")}
            </p>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
