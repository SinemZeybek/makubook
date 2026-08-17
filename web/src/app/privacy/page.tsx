import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../navbar";
import Footer from "../footer";

export default async function PrivacyPage() {
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

      <div className="flex-1 mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-berry">Privacy Policy</h1>
        <p className="mt-2 text-sm text-berry/60">Last updated: August 2026</p>

        <div className="mt-8 space-y-8 text-berry/80">
          <section>
            <h2 className="text-lg font-semibold text-berry">Who we are</h2>
            <p className="mt-2">
              Makubook is a recipe-sharing platform based in Finland. For
              anything related to this privacy policy or your data, you can{" "}
              <Link href="/contact" className="underline hover:text-berry">
                get in touch here
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              What data we collect
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Account information:</strong> email address,
                password (stored securely, we never see it in plain text),
                display name, birthday, and an optional profile picture.
              </li>
              <li>
                <strong>Content you create:</strong> recipes you submit
                (title, description, ingredients, instructions, photos),
                comments and ratings you leave on other recipes.
              </li>
              <li>
                <strong>Your saved recipes:</strong> which recipes you've
                saved — this list is private and only visible to you.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              Why we collect it
            </h2>
            <p className="mt-2">
              We use this data solely to run Makubook: creating and
              securing your account, letting you publish and manage
              recipes, showing your display name and avatar next to your
              contributions, and keeping track of the recipes you've
              saved. We do not sell your data or use it for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              Where your data is stored
            </h2>
            <p className="mt-2">
              All data is stored with Supabase, our database and hosting
              provider, in a data center located in the EU (Stockholm,
              Sweden).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">Cookies</h2>
            <p className="mt-2">
              We use a small number of essential cookies to keep you
              logged in. We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              Your rights
            </h2>
            <p className="mt-2">
              Under GDPR, you have the right to access, correct, or delete
              your personal data, and to request a copy of it. You can
              edit your display name and profile picture, and delete your
              own recipes and comments, directly in the app at any time.
              To request full deletion of your account and all associated
              data,{" "}
              <Link href="/contact" className="underline hover:text-berry">
                contact us here
              </Link>{" "}
              and we'll process it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">Changes</h2>
            <p className="mt-2">
              If this policy changes in a meaningful way, we'll update the
              date at the top of this page.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
