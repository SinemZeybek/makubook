import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "./navbar";
import Footer from "./footer";
import RecipeCard from "./recipe-card";
import SaveToggleButton from "./save-toggle-button";
import FadeIn from "./fade-in";
import { MEAL_TYPES } from "@/lib/mealTypes";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    country?: string;
    mealType?: string;
    language?: string;
    servings?: string;
  }>;
}) {
  const { q, country, mealType, language, servings } = await searchParams;
  const countryArr = country ? country.split(",") : [];
  const mealTypeArr = mealType ? mealType.split(",") : [];
  const languageArr = language ? language.split(",") : [];
  const servingsArr = servings ? servings.split(",") : [];
  const t = await getTranslations("Home");
  const tMeal = await getTranslations("MealTypes");
  const tCountry = await getTranslations("Countries");
  const tCommon = await getTranslations("Common");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  function servingsFilterExpr(bucket: string) {
    if (bucket === "7+") return "servings.gte.7";
    const [min, max] = bucket.split("-").map(Number);
    return `and(servings.gte.${min},servings.lte.${max})`;
  }

  let recipesQuery = supabase
    .from("recipes")
    .select(
      "id, title, description, country, meal_type, language, author_id, comments(rating), recipe_images(url), profiles(display_name, avatar_url)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (q) recipesQuery = recipesQuery.ilike("title", `%${q}%`);
  if (countryArr.length > 0) recipesQuery = recipesQuery.in("country", countryArr);
  if (mealTypeArr.length > 0)
    recipesQuery = recipesQuery.overlaps("meal_type", mealTypeArr);
  if (languageArr.length > 0)
    recipesQuery = recipesQuery.in("language", languageArr);
  if (servingsArr.length > 0)
    recipesQuery = recipesQuery.or(servingsArr.map(servingsFilterExpr).join(","));

  const { data: recipes, error } = await recipesQuery;
  const hasActiveFilters = Boolean(
    q ||
      countryArr.length > 0 ||
      mealTypeArr.length > 0 ||
      languageArr.length > 0 ||
      servingsArr.length > 0
  );

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

  function baseParams() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (countryArr.length) params.set("country", countryArr.join(","));
    if (languageArr.length) params.set("language", languageArr.join(","));
    if (servingsArr.length) params.set("servings", servingsArr.join(","));
    return params;
  }

  function clearMealTypesHref() {
    const params = baseParams();
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  function toggleMealTypeHref(type: string) {
    const params = baseParams();
    const nextMealTypes = mealTypeArr.includes(type)
      ? mealTypeArr.filter((m) => m !== type)
      : [...mealTypeArr, type];
    if (nextMealTypes.length) params.set("mealType", nextMealTypes.join(","));
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
      <div className="relative h-72 w-full overflow-hidden md:h-[420px]">
        <Image
          src="/dish-autumn-spread.jpg"
          alt="A spread of dishes from around the world"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-berry/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <FadeIn>
            <h1 className="font-logo text-4xl text-cream md:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-2 max-w-md text-cream/90 md:text-lg">
              {t("heroSubtitle")}
            </p>
          </FadeIn>
        </div>
      </div>

      {featuredRecipes && featuredRecipes.length > 0 && (
        <div className="mx-auto max-w-6xl px-6 pt-10">
          <FadeIn>
            <h2 className="text-xl font-semibold text-berry">
              {t("featuredHeading")}
            </h2>
          </FadeIn>
          <div className="mt-4 flex gap-5 overflow-x-auto overflow-y-hidden pb-2">
            {featuredRecipes.map((recipe, i) => (
              <FadeIn
                key={recipe.id}
                delay={i * 0.08}
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
                  <SaveToggleButton
                    recipeId={recipe.id}
                    userId={user?.id ?? null}
                    initialSaved={savedRecipeIds.has(recipe.id)}
                  />
                </div>
                <div className="flex flex-col p-4">
                  <h3 className="pointer-events-none text-lg font-medium text-berry">
                    {recipe.title}
                  </h3>
                  <div className="pointer-events-none mt-1 flex flex-wrap gap-1">
                    {recipe.country && (
                      <span className="rounded bg-gold/30 px-1.5 py-0.5 text-xs text-berry">
                        {tCountry(recipe.country)}
                      </span>
                    )}
                    {recipe.meal_type?.map((type: string) => (
                      <span
                        key={type}
                        className="rounded bg-berry/10 px-1.5 py-0.5 text-xs text-berry"
                      >
                        {tMeal(type)}
                      </span>
                    ))}
                  </div>
                  {recipe.description && (
                    <p className="pointer-events-none mt-2 text-sm text-berry/70">
                      {recipe.description}
                    </p>
                  )}

                  <div className="mt-auto flex justify-end pt-3">
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
                        {recipe.profiles?.display_name ?? tCommon("anonymous")}
                      </span>
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6 py-10">
        {error && (
          <p className="mt-8 text-red-600">
            Error loading recipes: {error.message}
          </p>
        )}

        <FadeIn className="mt-8 flex flex-wrap items-center gap-2">
          <Link
            href={clearMealTypesHref()}
            scroll={false}
            className={
              mealTypeArr.length === 0
                ? "rounded-full bg-berry px-4 py-1.5 text-sm text-cream"
                : "rounded-full border border-berry/20 px-4 py-1.5 text-sm text-berry hover:bg-berry/10"
            }
          >
            {t("all")}
          </Link>
          {MEAL_TYPES.map((type) => (
            <Link
              key={type}
              href={toggleMealTypeHref(type)}
              scroll={false}
              className={
                mealTypeArr.includes(type)
                  ? "rounded-full bg-berry px-4 py-1.5 text-sm text-cream"
                  : "rounded-full border border-berry/20 px-4 py-1.5 text-sm text-berry hover:bg-berry/10"
              }
            >
              {tMeal(type)}
            </Link>
          ))}
          {mealTypeArr.length > 0 && (
            <Link
              href={clearMealTypesHref()}
              scroll={false}
              className="text-sm text-berry/70 underline"
            >
              {t("clear")}
            </Link>
          )}
        </FadeIn>

        <div className="min-h-[50vh]">
          {!error && recipes && recipes.length === 0 && (
            <p className="mt-8 text-berry/70">
              {hasActiveFilters ? t("noRecipesFiltered") : t("noRecipesYet")}
            </p>
          )}

          {!error && recipes && recipes.length > 0 && (
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe, i) => (
                <FadeIn as="li" key={recipe.id} delay={Math.min(i, 8) * 0.06}>
                  <RecipeCard
                    recipe={recipe}
                    currentUserId={user?.id ?? null}
                    initialSaved={savedRecipeIds.has(recipe.id)}
                  />
                </FadeIn>
              ))}
            </ul>
          )}
        </div>

        {!user && (
          <FadeIn className="mt-16 rounded-lg bg-berry px-6 py-10 text-center">
            <h2 className="font-logo text-2xl text-cream">
              {t("ctaHeading")}
            </h2>
            <Link
              href="/login?mode=sign-up"
              className="mt-5 inline-block rounded-md bg-gold px-5 py-2.5 font-medium text-berry"
            >
              {t("signUp")}
            </Link>
          </FadeIn>
        )}
      </div>
      </div>

      <Footer />
    </main>
  );
}
