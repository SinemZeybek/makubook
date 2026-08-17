import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../../navbar";
import Footer from "../../footer";
import RecipeForm from "./recipe-form";

export default async function NewRecipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
      <div className="flex-1 mx-auto max-w-xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-berry">Add a recipe</h1>
        <RecipeForm userId={user.id} />
      </div>

      <Footer />
    </main>
  );
}
