import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../navbar";

export default async function AboutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-cream">
      <Navbar userEmail={user?.email ?? null} />

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h1 className="font-logo text-3xl text-berry md:text-4xl">
              Love Grows With Sharing
            </h1>
            <p className="mt-4 text-lg text-berry/70">
              Every recipe is a story. Share yours, and discover new flavors
              from homes around the world.
            </p>
          </div>
          <Image
            src="/hero-cooking-couple.jpg"
            alt="A couple cooking together in a cozy kitchen"
            width={600}
            height={450}
            className="h-64 w-full rounded-lg object-cover md:h-80"
          />
        </div>

        <section className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-berry">
            Connecting People With Food
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-berry/70">
            Makubook exists for one simple reason: food tastes better when
            it's shared. We're building a place where immigrants and expats
            living in Finland can share recipes from their home countries,
            and Finns can discover a taste of the world without leaving the
            kitchen table.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-center text-2xl font-semibold text-berry">
            Why Makubook?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-berry/70">
            Everything you need to share, discover, and celebrate food from
            around the world.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <Image
                src="/bilingual-icon-v2.png"
                alt=""
                width={80}
                height={80}
                className="h-20 w-20"
              />
              <p className="mt-3 text-sm font-medium text-berry">
                Bilingual Finnish/English
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Image
                src="/join-icon.png"
                alt=""
                width={80}
                height={80}
                className="h-20 w-20"
              />
              <p className="mt-3 text-sm font-medium text-berry">
                Free to join!
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Image
                src="/cuisine-globe-icon-v2.png"
                alt=""
                width={80}
                height={80}
                className="h-20 w-20"
              />
              <p className="mt-3 text-sm font-medium text-berry">
                Different cuisines, one platform
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Image
                src="/star-icon.png"
                alt=""
                width={80}
                height={80}
                className="h-20 w-20"
              />
              <p className="mt-3 text-sm font-medium text-berry">
                Community rated
              </p>
            </div>
          </div>
        </section>

        {!user && (
          <section className="mt-16 rounded-lg bg-berry px-6 py-10 text-center">
            <h2 className="font-logo text-2xl text-cream">
              Ready to share your first recipe?
            </h2>
            <Link
              href="/login"
              className="mt-5 inline-block rounded-md bg-gold px-5 py-2.5 font-medium text-berry"
            >
              Sign up
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
