import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RecipeForm from "./recipe-form";

export default async function NewRecipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Add a recipe
        </h1>
        <RecipeForm userId={user.id} />
      </div>
    </main>
  );
}
