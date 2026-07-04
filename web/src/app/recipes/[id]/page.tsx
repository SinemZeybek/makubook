import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CommentForm from "./comment-form";

type Ingredient = { quantity: string; unit: string; name: string };

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const { data: comments } = await supabase
    .from("comments")
    .select("id, body, rating, created_at, profiles(display_name, avatar_url)")
    .eq("recipe_id", id)
    .order("created_at", { ascending: false });

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

        <section className="mt-8">
          <h2 className="text-lg font-medium text-black dark:text-zinc-50">
            Comments
          </h2>

          {user ? (
            <CommentForm recipeId={recipe.id} />
          ) : (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href="/login" className="underline">
                Log in
              </Link>{" "}
              to leave a comment or rating.
            </p>
          )}

          <ul className="mt-6 space-y-4">
            {comments?.map((comment) => (
              <li
                key={comment.id}
                className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
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
                  <span className="font-medium text-black dark:text-zinc-50">
                    {comment.profiles?.display_name ?? "Anonymous"}
                  </span>
                  <span className="text-amber-500">
                    {"★".repeat(comment.rating ?? 0)}
                    {"☆".repeat(5 - (comment.rating ?? 0))}
                  </span>
                </div>
                <p className="mt-1 text-zinc-700 dark:text-zinc-300">
                  {comment.body}
                </p>
              </li>
            ))}
            {comments?.length === 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No comments yet.
              </p>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}
