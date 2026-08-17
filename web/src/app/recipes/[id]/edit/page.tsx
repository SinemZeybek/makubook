import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../../../navbar";
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
    <main className="min-h-screen bg-cream">
      <Navbar userEmail={user.email ?? null} userId={user.id} />
      <div className="mx-auto max-w-xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-berry">Edit recipe</h1>
        <EditRecipeForm recipe={recipe} userId={user.id} />
      </div>
    </main>
  );
}
