import { createClient } from "@/lib/supabase/server";
import Navbar from "../navbar";
import Footer from "../footer";
import ContactForm from "./contact-form";

export default async function ContactPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEditor = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isEditor = profile?.role === "editor";
  }

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar
        userEmail={user?.email ?? null}
        userId={user?.id ?? null}
        isEditor={isEditor}
      />

      <div className="flex-1 mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-berry">Get in touch</h1>
        <p className="mx-auto mt-3 max-w-xl text-berry/70">
          Questions, feedback, or a recipe idea you want to see on
          Makubook? We'd love to hear from you.
        </p>

        <ContactForm />
      </div>

      <Footer />
    </main>
  );
}
