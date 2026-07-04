import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditRecipeForm from "./edit-recipe-form";

export default async function EditRecipePage({
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
      "id, title, description, country, meal_type, language, ingredients, instructions, tips, author_id"
    )
    .eq("id", id)
    .single();

  if (error || !recipe) {
    notFound();
  }

  if (!user || user.id !== recipe.author_id) {
    redirect(`/recipes/${id}`);
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Edit recipe
        </h1>
        <EditRecipeForm recipe={recipe} userId={user.id} />
      </div>
    </main>
  );
}
