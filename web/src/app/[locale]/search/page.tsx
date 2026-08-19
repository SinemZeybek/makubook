import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../navbar";
import Footer from "../footer";
import RecipeCard from "../recipe-card";
import RecipeFilters from "../recipe-filters";
import FadeIn from "../fade-in";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    country?: string;
    mealType?: string;
    language?: string;
    servings?: string;
    page?: string;
  }>;
}) {
  const { q, country, mealType, language, servings, page } =
    await searchParams;
  const countryArr = country ? country.split(",") : [];
  const mealTypeArr = mealType ? mealType.split(",") : [];
  const languageArr = language ? language.split(",") : [];
  const servingsArr = servings ? servings.split(",") : [];
  const PAGE_SIZE = 12;
  const currentPage = Math.max(1, Number(page) || 1);
  const t = await getTranslations("Home");
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
      "id, title, description, country, meal_type, language, author_id, comments(rating), recipe_images(url), profiles(display_name, avatar_url)",
      { count: "exact" }
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

  const from = (currentPage - 1) * PAGE_SIZE;
  recipesQuery = recipesQuery.range(from, from + PAGE_SIZE - 1);

  const { data: recipes, error, count } = await recipesQuery;
  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;
  const hasActiveFilters = Boolean(
    q ||
      countryArr.length > 0 ||
      mealTypeArr.length > 0 ||
      languageArr.length > 0 ||
      servingsArr.length > 0
  );

  let similarRecipes: typeof recipes = null;
  if (!error && recipes && recipes.length === 0 && hasActiveFilters) {
    const sanitize = (value: string) => value.replace(/[(),]/g, "").trim();
    const orConditions: string[] = [];

    if (q) {
      q.split(/\s+/)
        .map(sanitize)
        .filter(Boolean)
        .forEach((word) => {
          orConditions.push(`title.ilike.%${word}%`);
          orConditions.push(`description.ilike.%${word}%`);
        });
    }
    if (countryArr.length > 0) {
      orConditions.push(`country.in.(${countryArr.map(sanitize).join(",")})`);
    }
    if (mealTypeArr.length > 0) {
      orConditions.push(`meal_type.ov.{${mealTypeArr.map(sanitize).join(",")}}`);
    }
    if (languageArr.length > 0) {
      orConditions.push(`language.in.(${languageArr.map(sanitize).join(",")})`);
    }
    servingsArr.forEach((bucket) => orConditions.push(servingsFilterExpr(bucket)));

    if (orConditions.length > 0) {
      const { data: similar } = await supabase
        .from("recipes")
        .select(
          "id, title, description, country, meal_type, language, author_id, comments(rating), recipe_images(url), profiles(display_name, avatar_url)"
        )
        .eq("status", "published")
        .or(orConditions.join(","))
        .order("created_at", { ascending: false })
        .limit(6);
      similarRecipes = similar;
    }
  }

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

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (countryArr.length) params.set("country", countryArr.join(","));
    if (mealTypeArr.length) params.set("mealType", mealTypeArr.join(","));
    if (languageArr.length) params.set("language", languageArr.join(","));
    if (servingsArr.length) params.set("servings", servingsArr.join(","));
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/search?${qs}` : "/search";
  }

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar
        userEmail={user?.email ?? null}
        userId={user?.id ?? null}
        isEditor={isEditor}
      />

      <div className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <RecipeFilters />

          {error && (
            <p className="mt-8 text-red-600">
              Error loading recipes: {error.message}
            </p>
          )}

          <FadeIn>
            <h2 className="mt-8 text-xl font-semibold text-berry">
              {hasActiveFilters
                ? t("searchResultsHeading")
                : t("allRecipesHeading")}
            </h2>
          </FadeIn>

          <div className="min-h-[50vh]">
            {!error && recipes && recipes.length === 0 && (
              <div className="mt-8">
                <p className="text-berry/70">
                  {hasActiveFilters ? t("noRecipesFiltered") : t("noRecipesYet")}
                </p>
                {hasActiveFilters && (
                  <Link href="/" className="mt-2 inline-block text-sm text-berry underline">
                    {t("backToAllRecipes")}
                  </Link>
                )}

                {similarRecipes && similarRecipes.length > 0 && (
                  <FadeIn>
                    <h3 className="mt-10 text-lg font-semibold text-berry">
                      {t("similarRecipesHeading")}
                    </h3>
                    <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {similarRecipes.map((recipe, i) => (
                        <FadeIn as="li" key={recipe.id} delay={Math.min(i, 8) * 0.06}>
                          <RecipeCard
                            recipe={recipe}
                            currentUserId={user?.id ?? null}
                            initialSaved={savedRecipeIds.has(recipe.id)}
                          />
                        </FadeIn>
                      ))}
                    </ul>
                  </FadeIn>
                )}
              </div>
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

            {!error && totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                {currentPage > 1 ? (
                  <Link
                    href={pageHref(currentPage - 1)}
                    className="rounded-md border border-berry/20 px-4 py-2 text-sm text-berry hover:bg-berry/10"
                  >
                    {t("previous")}
                  </Link>
                ) : (
                  <span className="rounded-md border border-berry/10 px-4 py-2 text-sm text-berry/30">
                    {t("previous")}
                  </span>
                )}

                <span className="text-sm text-berry/70">
                  {t("pageOf", { current: currentPage, total: totalPages })}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={pageHref(currentPage + 1)}
                    className="rounded-md border border-berry/20 px-4 py-2 text-sm text-berry hover:bg-berry/10"
                  >
                    {t("next")}
                  </Link>
                ) : (
                  <span className="rounded-md border border-berry/10 px-4 py-2 text-sm text-berry/30">
                    {t("next")}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
