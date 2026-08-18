import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SaveToggleButton from "./save-toggle-button";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  country: string | null;
  meal_type: string | null;
  language: string;
  author_id: string;
  status?: string;
  recipe_images: { url: string }[] | null;
  profiles: { display_name: string | null; avatar_url: string | null } | null;
};

export default function RecipeCard({
  recipe,
  currentUserId = null,
  initialSaved = false,
}: {
  recipe: Recipe;
  currentUserId?: string | null;
  initialSaved?: boolean;
}) {
  const t = useTranslations("RecipeCard");
  const tMeal = useTranslations("MealTypes");
  const tCommon = useTranslations("Common");

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-berry/15 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-berry/30 hover:shadow-md">
      <Link
        href={`/recipes/${recipe.id}`}
        className="absolute inset-0 z-0"
        aria-label={recipe.title}
      />

      <div className="pointer-events-none relative h-56 w-full shrink-0 bg-berry/5">
        {recipe.recipe_images?.[0]?.url && (
          <Image
            src={recipe.recipe_images[0].url}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        )}
        <SaveToggleButton
          recipeId={recipe.id}
          userId={currentUserId}
          initialSaved={initialSaved}
        />
        {recipe.status && recipe.status !== "published" && (
          <span
            className={`pointer-events-none absolute left-2 top-2 z-10 rounded-full px-2 py-1 text-xs font-medium ${
              recipe.status === "rejected"
                ? "bg-red-600 text-white"
                : "bg-gold text-berry"
            }`}
          >
            {recipe.status === "rejected" ? t("rejected") : t("pendingReview")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="pointer-events-none flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-medium text-berry">{recipe.title}</h2>
          {recipe.country && (
            <span className="rounded bg-gold/30 px-1.5 py-0.5 text-xs text-berry">
              {recipe.country}
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
          <p className="pointer-events-none mt-2 line-clamp-2 text-base text-berry/70">
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
                src={recipe.profiles?.avatar_url || "/default-avatar.png"}
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
    </div>
  );
}
