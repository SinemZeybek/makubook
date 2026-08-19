import { getTranslations, getLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../navbar";
import Footer from "../footer";
import RecipeCard from "../recipe-card";

export default async function SavedRecipesPage() {
  const t = await getTranslations("Saved");
  const locale = await getLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: favorites } = await supabase
    .from("favorites")
    .select(
      "recipe_id, recipes(id, title, description, country, meal_type, language, author_id, comments(rating), recipe_images(url), profiles(display_name, avatar_url))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const recipes = (favorites ?? [])
    .map((favorite) => favorite.recipes)
    .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe));

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar
        userEmail={user.email ?? null}
        userId={user.id}
        isEditor={profile?.role === "editor"}
      />

      <div className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-berry">{t("heading")}</h1>

        <div className="mt-8">
          {recipes.length > 0 ? (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <li key={recipe.id}>
                  <RecipeCard
                    recipe={recipe}
                    currentUserId={user.id}
                    initialSaved
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-berry/70">
              {t("emptyPrefix")}{" "}
              <Link href="/" className="underline">
                {t("homepage")}
              </Link>{" "}
              {t("emptySuffix")}
            </p>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
