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

  const { data: featuredRecipes } = await supabase
    .from("recipes")
    .select("id, title, country, meal_type, language, recipe_images(url)")
    .order("created_at", { ascending: false })
    .limit(5);

  const fallbackPhotos = [
    "/dish-breakfast.jpg",
    "/dish-dumplings-raw.jpg",
    "/dish-pickling.jpg",
    "/dish-dough-rolling.jpg",
    "/charcuterie-board.jpg",
  ];

  return (
    <main className="min-h-screen bg-cream">
      <Navbar userEmail={user?.email ?? null} />

      <div className="relative h-72 w-full md:h-[420px]">
        <Image
          src="/dish-mediterranean-spread.jpg"
          alt="A spread of dishes from around the world"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-berry/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-logo text-4xl text-cream md:text-6xl">
            Makubook
          </h1>
          <p className="mt-2 max-w-md text-cream/90 md:text-lg">
            Recipes from every home, shared with the world.
          </p>
        </div>
      </div>

      {featuredRecipes && featuredRecipes.length > 0 && (
        <div className="mx-auto max-w-6xl px-6 pt-10">
          <h2 className="text-xl font-semibold text-berry">
            Easy to access and follow recipes
          </h2>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {featuredRecipes.map((recipe, i) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="w-56 flex-shrink-0 overflow-hidden rounded-lg border border-berry/15 bg-white hover:border-berry/30"
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={
                      recipe.recipe_images?.[0]?.url ||
                      fallbackPhotos[i % fallbackPhotos.length]
                    }
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-berry">{recipe.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6 py-10">
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
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="block overflow-hidden rounded-lg border border-berry/15 bg-white hover:border-berry/30"
                >
                  <div className="relative h-40 w-full bg-berry/5">
                    {recipe.recipe_images?.[0]?.url && (
                      <Image
                        src={recipe.recipe_images[0].url}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
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
