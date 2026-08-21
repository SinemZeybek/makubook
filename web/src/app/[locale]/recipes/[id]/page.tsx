import type { ComponentProps } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateRecipeTranslation } from "@/lib/translateRecipe";
import Navbar from "../../navbar";
import Footer from "../../footer";
import CommentForm from "./comment-form";
import SaveButton from "./save-button";
import CommentList from "./comment-list";

type Ingredient = { quantity: string; unit: string; name: string };

export default async function RecipePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ original?: string }>;
}) {
  const { id } = await params;
  const { original } = await searchParams;
  const showOriginal = original === "1";
  const locale = await getLocale();
  const t = await getTranslations("RecipeDetail");
  const tMeal = await getTranslations("MealTypes");
  const tCountry = await getTranslations("Countries");
  const tUnit = await getTranslations("Units");
  const tSave = await getTranslations("Save");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(
      "id, title, description, country, meal_type, servings, language, ingredients, instructions, tips, author_id, status, like_count, translation_of, translations, recipe_images(url)"
    )
    .eq("id", id)
    .single();

  if (error || !recipe) {
    notFound();
  }

  let siblingRecipe: { id: string; language: string } | null = null;
  if (recipe.translation_of) {
    const { data: sibling } = await supabase
      .from("recipes")
      .select("id, language")
      .eq("id", recipe.translation_of)
      .eq("status", "published")
      .maybeSingle();
    siblingRecipe = sibling;
  }

  const { data: comments } = await supabase
    .from("comments")
    .select(
      "id, body, rating, created_at, user_id, helpful_count, profiles(display_name, avatar_url)"
    )
    .eq("recipe_id", id)
    .order("helpful_count", { ascending: false })
    .order("created_at", { ascending: false });

  let initialSaved = false;
  let isEditor = false;
  let votedCommentIds: string[] = [];
  if (user) {
    const { data: favorite } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("recipe_id", id)
      .maybeSingle();
    initialSaved = Boolean(favorite);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isEditor = profile?.role === "editor";

    if (comments && comments.length > 0) {
      const { data: votes } = await supabase
        .from("comment_helpful_votes")
        .select("comment_id")
        .eq("user_id", user.id)
        .in(
          "comment_id",
          comments.map((c) => c.id)
        );
      votedCommentIds = votes?.map((v) => v.comment_id) ?? [];
    }
  }

  const ingredients = Array.isArray(recipe.ingredients)
    ? (recipe.ingredients as Ingredient[])
    : [];
  const instructions = Array.isArray(recipe.instructions)
    ? (recipe.instructions as string[])
    : [];

  const needsTranslation =
    !showOriginal && locale !== recipe.language && !siblingRecipe;

  const translation = needsTranslation
    ? await getOrCreateRecipeTranslation({
        recipeId: recipe.id,
        targetLocale: locale,
        existingTranslations: recipe.translations as Record<
          string,
          import("@/lib/translateRecipe").RecipeTranslation
        > | null,
        title: recipe.title,
        description: recipe.description,
        tips: recipe.tips,
        ingredients,
        instructions,
      })
    : null;

  const displayTitle = translation?.title ?? recipe.title;
  const displayDescription = translation
    ? translation.description
    : recipe.description;
  const displayTips = translation ? translation.tips : recipe.tips;
  const displayIngredients = translation
    ? ingredients.map((ing, i) => ({
        ...ing,
        name: translation.ingredientNames?.[i] ?? ing.name,
      }))
    : ingredients;
  const displayInstructions = translation
    ? (translation.instructions ?? instructions)
    : instructions;

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar
        userEmail={user?.email ?? null}
        userId={user?.id ?? null}
        isEditor={isEditor}
      />

      <div className="flex-1 mx-auto w-full max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-berry underline">
            {t("backToRecipes")}
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <SaveButton
                recipeId={recipe.id}
                userId={user.id}
                initialSaved={initialSaved}
                initialLikeCount={recipe.like_count ?? 0}
              />
            ) : (
              <span className="text-sm text-berry/60">
                {tSave("likeCount", { count: recipe.like_count ?? 0 })}
              </span>
            )}
            {user?.id === recipe.author_id && (
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className="text-sm text-berry underline"
              >
                {t("edit")}
              </Link>
            )}
          </div>
        </div>

        {recipe.status !== "published" && (
          <div
            className={`mt-4 rounded-md px-4 py-2 text-sm font-medium ${
              recipe.status === "rejected"
                ? "bg-red-600/10 text-red-700"
                : "bg-gold/20 text-berry"
            }`}
          >
            {recipe.status === "rejected"
              ? t("rejectedBanner")
              : t("pendingBanner")}
          </div>
        )}

        {recipe.recipe_images?.[0]?.url && (
          <Image
            src={recipe.recipe_images[0].url}
            alt={displayTitle}
            width={768}
            height={432}
            className="mt-4 h-72 w-full rounded-lg object-cover"
          />
        )}

        <div className="mt-4">
          <h1 className="text-3xl font-semibold text-berry">
            {displayTitle}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
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
            <span className="rounded bg-berry px-1.5 py-0.5 text-xs uppercase text-cream">
              {recipe.language}
            </span>
          </div>
          {siblingRecipe && (
            <Link
              href={`/recipes/${siblingRecipe.id}`}
              className="mt-2 inline-block text-sm text-berry underline"
            >
              {siblingRecipe.language === "en"
                ? t("viewInEnglish")
                : t("viewInFinnish")}
            </Link>
          )}
        </div>

        {translation && (
          <div className="mt-4 rounded-md bg-gold/15 px-4 py-2.5 text-sm text-berry">
            {translation.machineTranslated ? (
              <>
                {t("autoTranslatedNotice")}{" "}
                <Link href={`/recipes/${recipe.id}?original=1`} className="underline">
                  {t("viewOriginal")}
                </Link>
              </>
            ) : (
              t("translationUnavailableNotice")
            )}
          </div>
        )}

        {showOriginal && locale !== recipe.language && (
          <div className="mt-4 rounded-md bg-berry/10 px-4 py-2.5 text-sm text-berry">
            {t("viewingOriginalNotice")}{" "}
            <Link href={`/recipes/${recipe.id}`} className="underline">
              {t("viewTranslated")}
            </Link>
          </div>
        )}

        {displayDescription && (
          <p className="mt-2 whitespace-pre-line text-berry/70">
            {displayDescription}
          </p>
        )}

        {recipe.servings && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-3.5 py-1.5 text-sm font-semibold text-berry">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {t("serves", { count: recipe.servings })}
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-medium text-berry">{t("ingredients")}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-berry/80">
            {displayIngredients.map((ingredient, i) => (
              <li key={i}>
                {ingredient.quantity} {ingredient.unit && tUnit(ingredient.unit)}{" "}
                {ingredient.name}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-medium text-berry">{t("steps")}</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-berry/80">
            {displayInstructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        {displayTips && (
          <section className="mt-8 rounded-lg bg-gold/15 p-4">
            <h2 className="text-lg font-medium text-berry">{t("tips")}</h2>
            <p className="mt-2 whitespace-pre-line text-berry/80">
              {displayTips}
            </p>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-medium text-berry">{t("comments")}</h2>

          {user ? (
            <CommentForm recipeId={recipe.id} />
          ) : (
            <p className="mt-2 text-sm text-berry/70">
              <Link href="/login" className="underline">
                {t("logIn")}
              </Link>{" "}
              {t("toComment")}
            </p>
          )}

          <CommentList
            comments={(comments ?? []) as unknown as ComponentProps<
              typeof CommentList
            >["comments"]}
            currentUserId={user?.id ?? null}
            isEditor={isEditor}
            votedCommentIds={votedCommentIds}
          />
        </section>
      </div>

      <Footer />
    </main>
  );
}
