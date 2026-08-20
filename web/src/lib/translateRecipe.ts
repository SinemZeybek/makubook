import { createAdminClient } from "./supabase/admin";
import { translateTexts } from "./translate";

type Ingredient = { quantity: string; unit: string; name: string };

export type RecipeTranslation = {
  title: string;
  description: string | null;
  tips: string | null;
  ingredientNames: string[];
  instructions: string[];
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
  if (cached) return cached;

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
 * Translates the title/description of a list of recipe cards for display
 * in the current locale, reusing the same per-recipe translation cache as
 * the detail page (so opening a card afterward is already warm).
 * Recipes already in the target locale pass through untouched.
 */
export async function translateCardList<
  T extends {
    id: string;
    title: string;
    description: string | null;
    tips: string | null;
    language: string;
    ingredients: unknown;
    instructions: unknown;
    translations: unknown;
  },
>(recipes: T[], locale: string): Promise<T[]> {
  return Promise.all(
    recipes.map(async (recipe) => {
      if (recipe.language === locale) return recipe;

      const ingredients = Array.isArray(recipe.ingredients)
        ? (recipe.ingredients as Ingredient[])
        : [];
      const instructions = Array.isArray(recipe.instructions)
        ? (recipe.instructions as string[])
        : [];

      const translation = await getOrCreateRecipeTranslation({
        recipeId: recipe.id,
        targetLocale: locale,
        existingTranslations: recipe.translations as Record<
          string,
          RecipeTranslation
        > | null,
        title: recipe.title,
        description: recipe.description,
        tips: recipe.tips,
        ingredients,
        instructions,
      });

      return {
        ...recipe,
        title: translation.title,
        description: translation.description,
      };
    })
  );
}
