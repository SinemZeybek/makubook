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
