import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, description, country, language, recipe_images(url)")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            Ruoka-Kirja
          </h1>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm text-zinc-600 underline dark:text-zinc-400"
            >
              Log in
            </Link>
          )}
        </div>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Recipes shared by the community.
        </p>

        {user && (
          <Link
            href="/recipes/new"
            className="mt-6 inline-block rounded-md bg-black px-3 py-2 text-sm text-white dark:bg-zinc-50 dark:text-black"
          >
            Add a recipe
          </Link>
        )}

        {error && (
          <p className="mt-8 text-red-600">
            Error loading recipes: {error.message}
          </p>
        )}

        {!error && recipes && recipes.length === 0 && (
          <p className="mt-8 text-zinc-600 dark:text-zinc-400">
            No recipes yet — be the first to add one!
          </p>
        )}

        {!error && recipes && recipes.length > 0 && (
          <ul className="mt-8 space-y-4">
            {recipes.map((recipe) => (
              <li
                key={recipe.id}
                className="flex gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                {recipe.recipe_images?.[0]?.url && (
                  <Image
                    src={recipe.recipe_images[0].url}
                    alt={recipe.title}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-md object-cover"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-medium text-black dark:text-zinc-50">
                      {recipe.title}
                    </h2>
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
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {recipe.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
