import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "./navbar";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    country?: string;
    mealType?: string;
    language?: string;
  }>;
}) {
  const { q, country, mealType, language } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let recipesQuery = supabase
    .from("recipes")
    .select(
      "id, title, description, country, meal_type, language, recipe_images(url)"
    )
    .order("created_at", { ascending: false });

  if (q) recipesQuery = recipesQuery.ilike("title", `%${q}%`);
  if (country) recipesQuery = recipesQuery.eq("country", country);
  if (mealType) recipesQuery = recipesQuery.eq("meal_type", mealType);
  if (language) recipesQuery = recipesQuery.eq("language", language);

  const { data: recipes, error } = await recipesQuery;
  const hasActiveFilters = Boolean(q || country || mealType || language);

  return (
    <main className="min-h-screen bg-cream">
      <Navbar userEmail={user?.email ?? null} />

      <div className="relative h-72 w-full">
        <Image
          src="/dish-mediterranean-spread.jpg"
          alt="A spread of dishes from around the world"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-berry/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-4xl font-semibold text-cream">Makubook</h1>
          <p className="mt-2 max-w-md text-cream/90">
            Recipes from every home, shared with the world.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">

        {user && (
          <Link
            href="/recipes/new"
            className="mt-4 inline-block rounded-md bg-gold px-4 py-2 text-sm font-medium text-berry"
          >
            Add a recipe
          </Link>
        )}

        {error && (
          <p className="mt-8 text-red-600">
            Error loading recipes: {error.message}
          </p>
        )}

        {!error && recipes && recipes.length === 0 && (
          <p className="mt-8 text-berry/70">
            {hasActiveFilters
              ? "No recipes match your filters."
              : "No recipes yet — be the first to add one!"}
          </p>
        )}

        {!error && recipes && recipes.length > 0 && (
          <ul className="mt-8 space-y-4">
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="flex gap-4 rounded-lg border border-berry/15 bg-white p-4 hover:border-berry/30"
                >
                  {recipe.recipe_images?.[0]?.url && (
                    <Image
                      src={recipe.recipe_images[0].url}
                      alt={recipe.title}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-medium text-berry">
                        {recipe.title}
                      </h2>
                      {recipe.country && (
                        <span className="rounded bg-gold/30 px-1.5 py-0.5 text-xs text-berry">
                          {recipe.country}
                        </span>
                      )}
                      {recipe.meal_type && (
                        <span className="rounded bg-berry/10 px-1.5 py-0.5 text-xs text-berry">
                          {recipe.meal_type}
                        </span>
                      )}
                      <span className="rounded bg-berry px-1.5 py-0.5 text-xs uppercase text-cream">
                        {recipe.language}
                      </span>
                    </div>
                    {recipe.description && (
                      <p className="mt-1 text-berry/70">
                        {recipe.description}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
