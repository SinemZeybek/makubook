import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../../navbar";
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
    <main className="min-h-screen bg-cream">
      <Navbar userEmail={user.email ?? null} />
      <div className="mx-auto max-w-xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-berry">Add a recipe</h1>
        <RecipeForm userId={user.id} />
      </div>
    </main>
  );
}
