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
    .select("id, title, description")
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
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <h2 className="text-lg font-medium text-black dark:text-zinc-50">
                  {recipe.title}
                </h2>
                {recipe.description && (
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {recipe.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
