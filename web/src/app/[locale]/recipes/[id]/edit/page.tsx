import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../../../navbar";
import Footer from "../../../footer";
import EditRecipeForm from "./edit-recipe-form";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("RecipeForm");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(
      "id, title, description, country, meal_type, servings, language, ingredients, instructions, tips, author_id, recipe_images(url)"
    )
    .eq("id", id)
    .single();

  if (error || !recipe) {
    notFound();
  }

  if (!user || user.id !== recipe.author_id) {
    redirect(`/recipes/${id}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar
        userEmail={user.email ?? null}
        userId={user.id}
        isEditor={profile?.role === "editor"}
      />
      <div className="flex-1 mx-auto w-full max-w-xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-berry">{t("editHeading")}</h1>
        <EditRecipeForm recipe={recipe} userId={user.id} />
      </div>

      <Footer />
    </main>
  );
}
