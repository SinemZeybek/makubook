import { createAdminClient } from "./supabase/admin";
import { translateTexts } from "./translate";

type Ingredient = { quantity: string; unit: string; name: string };

export type RecipeTranslation = {
  title: string;
  description: string | null;
  tips: string | null;
  // Absent on a partial (card-list-only) translation — only a full pass
  // (via getOrCreateRecipeTranslation) populates these.
  ingredientNames?: string[];
  instructions?: string[];
  machineTranslated: boolean;
};

export async function getOrCreateRecipeTranslation({
  recipeId,
  targetLocale,
  existingTranslations,
  title,
  description,
  tips,
  ingredients,
  instructions,
}: {
  recipeId: string;
  targetLocale: string;
  existingTranslations: Record<string, RecipeTranslation> | null | undefined;
  title: string;
  description: string | null;
  tips: string | null;
  ingredients: Ingredient[];
  instructions: string[];
}): Promise<RecipeTranslation> {
  const cached = existingTranslations?.[targetLocale];
  // A cache entry written by the lightweight card-list translation only has
  // title/description — not a full translation. Only trust it here if it
  // actually has instructions (i.e. it came from a full pass already).
  if (cached && cached.instructions) return cached;

  const texts = [
    title,
    description ?? "",
    tips ?? "",
    ...ingredients.map((i) => i.name),
    ...instructions,
  ];
  const { texts: translated, ok } = await translateTexts(texts, targetLocale);

  const result: RecipeTranslation = {
    title: translated[0],
    description: description ? translated[1] : null,
    tips: tips ? translated[2] : null,
    ingredientNames: translated.slice(3, 3 + ingredients.length),
    instructions: translated.slice(3 + ingredients.length),
    machineTranslated: ok,
  };

  if (ok) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const admin = createAdminClient();
      await admin
        .from("recipes")
        .update({
          translations: {
            ...(existingTranslations ?? {}),
            [targetLocale]: result,
          },
        })
        .eq("id", recipeId);
    }
  }

  return result;
}

/**
 * Lightweight translation for card display — only title/description, since
 * that's all a recipe card ever renders. Deliberately does NOT require (or
 * fetch) ingredients/instructions: those are large fields only needed on
 * the recipe detail page, and selecting them for every recipe on every
 * list page (homepage, search, saved, profile) was a real contributor to
 * Supabase egress. Writes a partial cache entry so repeat list views don't
 * re-call DeepL; the detail page's full pass later overwrites it.
 */
async function getOrCreateCardTranslation({
  recipeId,
  targetLocale,
  existingTranslations,
  title,
  description,
}: {
  recipeId: string;
  targetLocale: string;
  existingTranslations: Record<string, RecipeTranslation> | null | undefined;
  title: string;
  description: string | null;
}): Promise<Pick<RecipeTranslation, "title" | "description" | "machineTranslated">> {
  const cached = existingTranslations?.[targetLocale];
  if (cached) return cached;

  const texts = [title, description ?? ""];
  const { texts: translated, ok } = await translateTexts(texts, targetLocale);

  const result = {
    title: translated[0],
    description: description ? translated[1] : null,
    machineTranslated: ok,
  };

  if (ok) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const admin = createAdminClient();
      await admin
        .from("recipes")
        .update({
          translations: {
            ...(existingTranslations ?? {}),
            [targetLocale]: { tips: null, ...(existingTranslations?.[targetLocale] ?? {}), ...result },
          },
        })
        .eq("id", recipeId);
    }
  }

  return result;
}

/**
 * Translates the title/description of a list of recipe cards for display
 * in the current locale. Recipes already in the target locale pass through
 * untouched. Does not need or fetch ingredients/instructions — see
 * getOrCreateCardTranslation.
 */
export async function translateCardList<
  T extends {
    id: string;
    title: string;
    description: string | null;
    language: string;
    translations: unknown;
  },
>(recipes: T[], locale: string): Promise<T[]> {
  return Promise.all(
    recipes.map(async (recipe) => {
      if (recipe.language === locale) return recipe;

      const translation = await getOrCreateCardTranslation({
        recipeId: recipe.id,
        targetLocale: locale,
        existingTranslations: recipe.translations as Record<
          string,
          RecipeTranslation
        > | null,
        title: recipe.title,
        description: recipe.description,
      });

      return {
        ...recipe,
        title: translation.title,
        description: translation.description,
      };
    })
  );
}
