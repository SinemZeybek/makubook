import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "./navbar";
import Footer from "./footer";
import RecipeCard from "./recipe-card";
import { MEAL_TYPES } from "@/lib/mealTypes";

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
      "id, title, description, country, meal_type, language, author_id, recipe_images(url), profiles(display_name, avatar_url)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (q) recipesQuery = recipesQuery.ilike("title", `%${q}%`);
  if (country) recipesQuery = recipesQuery.eq("country", country);
  if (mealType) recipesQuery = recipesQuery.eq("meal_type", mealType);
  if (language) recipesQuery = recipesQuery.eq("language", language);

  const { data: recipes, error } = await recipesQuery;
  const hasActiveFilters = Boolean(q || country || mealType || language);

  let savedRecipeIds = new Set<string>();
  let isEditor = false;
  if (user) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("recipe_id")
      .eq("user_id", user.id);
    savedRecipeIds = new Set(favorites?.map((f) => f.recipe_id));

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isEditor = profile?.role === "editor";
  }

  function categoryHref(type?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (country) params.set("country", country);
    if (type) params.set("mealType", type);
    if (language) params.set("language", language);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  const { data: featuredRecipes } = await supabase
    .from("recipes")
    .select(
      "id, title, description, country, meal_type, language, author_id, recipe_images(url), profiles(display_name, avatar_url)"
    )
    .eq("status", "published")
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
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar
        userEmail={user?.email ?? null}
        userId={user?.id ?? null}
        isEditor={isEditor}
      />

      <div className="flex-1">
      <div className="relative h-72 w-full md:h-[420px]">
        <Image
          src="/dish-autumn-spread.jpg"
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
          <div className="mt-4 flex gap-5 overflow-x-auto pb-2">
            {featuredRecipes.map((recipe, i) => (
              <div
                key={recipe.id}
                className="relative w-72 flex-shrink-0 overflow-hidden rounded-lg border border-berry/15 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-berry/30 hover:shadow-md"
              >
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="absolute inset-0 z-0"
                  aria-label={recipe.title}
                />
                <div className="pointer-events-none relative h-48 w-full">
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
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="pointer-events-none text-lg font-medium text-berry">
                      {recipe.title}
                    </h3>
                    <Link
                      href={`/profile/${recipe.author_id}`}
                      className="relative z-10 flex shrink-0 items-center gap-1.5 hover:underline"
                    >
                      <div className="relative h-5 w-5 overflow-hidden rounded-full">
                        <Image
                          src={
                            recipe.profiles?.avatar_url ||
                            "/default-avatar.png"
                          }
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-xs text-berry/60">
                        {recipe.profiles?.display_name ?? "Anonymous"}
                      </span>
                    </Link>
                  </div>
                  <div className="pointer-events-none mt-1 flex flex-wrap gap-1">
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
                  {recipe.description && (
                    <p className="pointer-events-none mt-2 text-sm text-berry/70">
                      {recipe.description}
                    </p>
                  )}
                </div>
              </div>
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

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href={categoryHref(undefined)}
            scroll={false}
            className={
              !mealType
                ? "rounded-full bg-berry px-4 py-1.5 text-sm text-cream"
                : "rounded-full border border-berry/20 px-4 py-1.5 text-sm text-berry hover:bg-berry/10"
            }
          >
            All
          </Link>
          {MEAL_TYPES.map((type) => (
            <Link
              key={type}
              href={categoryHref(type)}
              scroll={false}
              className={
                mealType === type
                  ? "rounded-full bg-berry px-4 py-1.5 text-sm text-cream"
                  : "rounded-full border border-berry/20 px-4 py-1.5 text-sm text-berry hover:bg-berry/10"
              }
            >
              {type}
            </Link>
          ))}
        </div>

        <div className="min-h-[50vh]">
          {!error && recipes && recipes.length === 0 && (
            <p className="mt-8 text-berry/70">
              {hasActiveFilters
                ? "No recipes match your filters."
                : "No recipes yet — be the first to add one!"}
            </p>
          )}

          {!error && recipes && recipes.length > 0 && (
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          )}
        </div>

        {!user && (
          <section className="mt-16 rounded-lg bg-berry px-6 py-10 text-center">
            <h2 className="font-logo text-2xl text-cream">
              Ready to share your first recipe?
            </h2>
            <Link
              href="/login"
              className="mt-5 inline-block rounded-md bg-gold px-5 py-2.5 font-medium text-berry"
            >
              Sign up
            </Link>
          </section>
        )}
      </div>
      </div>

      <Footer />
    </main>
  );
}
