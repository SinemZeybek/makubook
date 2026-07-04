import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Ingredient = { quantity: string; unit: string; name: string };

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(
      "id, title, description, country, language, ingredients, instructions, tips, recipe_images(url)"
    )
    .eq("id", id)
    .single();

  if (error || !recipe) {
    notFound();
  }

  const ingredients = Array.isArray(recipe.ingredients)
    ? (recipe.ingredients as Ingredient[])
    : [];
  const instructions = Array.isArray(recipe.instructions)
    ? (recipe.instructions as string[])
    : [];

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          Back to recipes
        </Link>

        {recipe.recipe_images?.[0]?.url && (
          <Image
            src={recipe.recipe_images[0].url}
            alt={recipe.title}
            width={640}
            height={360}
            className="mt-4 h-64 w-full rounded-lg object-cover"
          />
        )}

        <div className="mt-4 flex items-center gap-2">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            {recipe.title}
          </h1>
          {recipe.country && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              {recipe.country}
            </span>
          )}
          <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {recipe.language}
          </span>
        </div>

        {recipe.description && (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {recipe.description}
          </p>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-medium text-black dark:text-zinc-50">
            Ingredients
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">
            {ingredients.map((ingredient, i) => (
              <li key={i}>
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-medium text-black dark:text-zinc-50">
            Steps
          </h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
            {instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        {recipe.tips && (
          <section className="mt-8 rounded-lg bg-amber-50 p-4 dark:bg-amber-950">
            <h2 className="text-lg font-medium text-black dark:text-zinc-50">
              Tips
            </h2>
            <p className="mt-2 text-zinc-700 dark:text-zinc-300">
              {recipe.tips}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
