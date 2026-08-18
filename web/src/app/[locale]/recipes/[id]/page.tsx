import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../../navbar";
import Footer from "../../footer";
import CommentForm from "./comment-form";
import SaveButton from "./save-button";

type Ingredient = { quantity: string; unit: string; name: string };

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("RecipeDetail");
  const tMeal = await getTranslations("MealTypes");
  const tCountry = await getTranslations("Countries");
  const tUnit = await getTranslations("Units");
  const tCommon = await getTranslations("Common");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(
      "id, title, description, country, meal_type, servings, language, ingredients, instructions, tips, author_id, status, recipe_images(url)"
    )
    .eq("id", id)
    .single();

  if (error || !recipe) {
    notFound();
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("id, body, rating, created_at, profiles(display_name, avatar_url)")
    .eq("recipe_id", id)
    .order("created_at", { ascending: false });

  let initialSaved = false;
  let isEditor = false;
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
  }

  const ingredients = Array.isArray(recipe.ingredients)
    ? (recipe.ingredients as Ingredient[])
    : [];
  const instructions = Array.isArray(recipe.instructions)
    ? (recipe.instructions as string[])
    : [];

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar
        userEmail={user?.email ?? null}
        userId={user?.id ?? null}
        isEditor={isEditor}
      />

      <div className="flex-1 mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-berry underline">
            {t("backToRecipes")}
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <SaveButton
                recipeId={recipe.id}
                userId={user.id}
                initialSaved={initialSaved}
              />
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
            alt={recipe.title}
            width={768}
            height={432}
            className="mt-4 h-72 w-full rounded-lg object-cover"
          />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold text-berry">
            {recipe.title}
          </h1>
          {recipe.country && (
            <span className="rounded bg-gold/30 px-1.5 py-0.5 text-xs text-berry">
              {tCountry(recipe.country)}
            </span>
          )}
          {recipe.meal_type && (
            <span className="rounded bg-berry/10 px-1.5 py-0.5 text-xs text-berry">
              {tMeal(recipe.meal_type)}
            </span>
          )}
          <span className="rounded bg-berry px-1.5 py-0.5 text-xs uppercase text-cream">
            {recipe.language}
          </span>
        </div>

        {recipe.description && (
          <p className="mt-2 text-berry/70">{recipe.description}</p>
        )}

        {recipe.servings && (
          <p className="mt-3 text-sm font-medium text-berry">
            {t("serves", { count: recipe.servings })}
          </p>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-medium text-berry">{t("ingredients")}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-berry/80">
            {ingredients.map((ingredient, i) => (
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
            {instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        {recipe.tips && (
          <section className="mt-8 rounded-lg bg-gold/15 p-4">
            <h2 className="text-lg font-medium text-berry">{t("tips")}</h2>
            <p className="mt-2 text-berry/80">{recipe.tips}</p>
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

          <ul className="mt-6 space-y-4">
            {comments?.map((comment) => (
              <li
                key={comment.id}
                className="rounded-lg border border-berry/15 bg-white p-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-6 w-6 overflow-hidden rounded-full">
                    <Image
                      src={comment.profiles?.avatar_url || "/default-avatar.png"}
                      alt=""
                      width={24}
                      height={24}
                      className="h-full w-full object-cover"
                      style={
                        comment.profiles?.avatar_url
                          ? undefined
                          : { transform: "scale(1.2)" }
                      }
                    />
                  </div>
                  <span className="font-medium text-berry">
                    {comment.profiles?.display_name ?? tCommon("anonymous")}
                  </span>
                  <span className="text-gold-dark">
                    {"★".repeat(comment.rating ?? 0)}
                    {"☆".repeat(5 - (comment.rating ?? 0))}
                  </span>
                </div>
                <p className="mt-1 text-berry/80">{comment.body}</p>
              </li>
            ))}
            {comments?.length === 0 && (
              <p className="text-sm text-berry/70">{t("noComments")}</p>
            )}
          </ul>
        </section>
      </div>

      <Footer />
    </main>
  );
}
