import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../navbar";
import Footer from "../footer";
import FadeIn from "../fade-in";

const CONTACT_EMAIL_LABEL = "Get in touch";

export default async function AboutPage() {
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

      <div className="flex-1">
        <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
          <Image
            src="/hero-cooking-couple.jpg"
            alt="A couple cooking together in a cozy kitchen"
            fill
            priority
            className="animate-ken-burns object-cover object-[50%_20%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-berry via-berry/70 to-berry/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <FadeIn>
              <h1 className="font-logo text-4xl text-cream md:text-6xl">
                Love Grows With Sharing
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-lg text-cream/90 md:text-xl">
                Every recipe is a story. Share yours, and discover new
                flavors from homes around the world.
              </p>
            </FadeIn>
          </div>
        </div>

        <section className="bg-white py-20">
          <FadeIn className="mx-auto max-w-3xl px-6 text-center">
            <span className="font-logo text-sm uppercase tracking-widest text-gold-dark">
              Our story
            </span>
            <h2 className="mt-3 text-3xl font-semibold text-berry md:text-4xl">
              Connecting People With Food
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-berry/70">
              Makubook exists for one simple reason: to connect through
              food from around the world. We're building a place where
              everyone can share food from their homes and be able to
              taste all the cuisines they wish to try. Now with no
              language barrier, you can discover a taste of the world
              without leaving the kitchen table.
            </p>
          </FadeIn>
        </section>

        <section className="bg-cream py-20">
          <div className="mx-auto max-w-5xl px-6">
            <FadeIn className="text-center">
              <span className="font-logo text-sm uppercase tracking-widest text-gold-dark">
                How it works
              </span>
              <h2 className="mt-3 text-3xl font-semibold text-berry md:text-4xl">
                From your kitchen to everyone's
              </h2>
            </FadeIn>

            <div className="mt-14 grid gap-10 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Share a recipe",
                  body: "Write up a dish you love making, add a photo and tell people the story behind it.",
                },
                {
                  step: "2",
                  title: "We take a quick look",
                  body: "An editor reviews new recipes before they go live, just to keep things tidy and well presented.",
                },
                {
                  step: "3",
                  title: "The world discovers it",
                  body: "Your recipe joins the collection - saved, cooked, and commented on by people you've never met.",
                },
              ].map((item, i) => (
                <FadeIn key={item.step} delay={i * 0.12} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-berry font-logo text-2xl text-cream shadow-md">
                    {item.step}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-berry">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-berry/70">{item.body}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <FadeIn className="text-center">
              <span className="font-logo text-sm uppercase tracking-widest text-gold-dark">
                Why Makubook
              </span>
              <h2 className="mt-3 text-3xl font-semibold text-berry md:text-4xl">
                Everything you need to share &amp; discover
              </h2>
            </FadeIn>

            <div className="mt-14 grid grid-cols-2 gap-10 sm:grid-cols-4">
              {[
                {
                  src: "/bilingual-icon-v2.png",
                  size: 80,
                  label: "Bilingual Finnish/English",
                },
                {
                  src: "/join-icon-transparent.png",
                  size: 100,
                  label: "Free to join!",
                },
                {
                  src: "/cuisine-globe-icon-v2.png",
                  size: 80,
                  label: "Different cuisines, one platform",
                },
                {
                  src: "/star-icon-transparent.png",
                  size: 100,
                  label: "Community rated",
                },
              ].map((item, i) => (
                <FadeIn
                  key={item.label}
                  delay={i * 0.08}
                  className="flex flex-col items-center text-center transition-transform duration-200 hover:-translate-y-1"
                >
                  <Image
                    src={item.src}
                    alt=""
                    width={item.size}
                    height={item.size}
                    className={
                      item.size === 100 ? "h-24 w-24" : "h-20 w-20"
                    }
                  />
                  <p className="mt-3 text-sm font-medium text-berry">
                    {item.label}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {!user && (
          <section className="bg-berry py-20">
            <FadeIn className="mx-auto max-w-2xl px-6 text-center">
              <h2 className="font-logo text-3xl text-cream md:text-4xl">
                Ready to share your first recipe?
              </h2>
              <p className="mt-3 text-cream/80">
                It only takes a few minutes, and it might be someone's
                new favorite dish.
              </p>
              <Link
                href="/login?mode=sign-up"
                className="mt-6 inline-block rounded-md bg-gold px-6 py-3 font-medium text-berry transition-transform duration-200 hover:-translate-y-0.5"
              >
                Sign up
              </Link>
            </FadeIn>
          </section>
        )}

        <section className="bg-cream py-20">
          <FadeIn className="mx-auto max-w-xl px-6 text-center">
            <h2 className="text-2xl font-semibold text-berry">
              {CONTACT_EMAIL_LABEL}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-berry/70">
              Questions, feedback, or a recipe idea you want to see on
              Makubook? We'd love to hear from you.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-block rounded-md border border-berry/20 px-5 py-2.5 font-medium text-berry hover:bg-berry/10"
            >
              Contact us
            </Link>
          </FadeIn>
        </section>
      </div>

      <Footer />
    </main>
  );
}
