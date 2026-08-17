import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../navbar";
import Footer from "../footer";
import RecipeCard from "../recipe-card";

export default async function SavedRecipesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: favorites } = await supabase
    .from("favorites")
    .select(
      "recipe_id, recipes(id, title, description, country, meal_type, language, author_id, recipe_images(url), profiles(display_name, avatar_url))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const recipes = (favorites ?? [])
    .map((favorite) => favorite.recipes)
    .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe));

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar userEmail={user.email ?? null} userId={user.id} />

      <div className="flex-1 mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-berry">
          Your saved recipes
        </h1>

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
              You haven't saved any recipes yet. Browse the{" "}
              <a href="/" className="underline">
                homepage
              </a>{" "}
              to find something you love.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
