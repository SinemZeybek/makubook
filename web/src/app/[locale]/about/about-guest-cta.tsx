"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCurrentUser } from "@/lib/useCurrentUser";
import FadeIn from "../fade-in";

export default function AboutGuestCta() {
  const t = useTranslations("About");
  const { user, loading } = useCurrentUser();

  if (loading || user) return null;

  return (
    <section className="bg-berry py-20">
      <FadeIn className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-logo text-3xl text-cream md:text-4xl">
          {t("ctaHeading")}
        </h2>
        <p className="mt-3 text-cream/80">{t("ctaBody")}</p>
        <Link
          href="/login?mode=sign-up"
          className="mt-6 inline-block rounded-md bg-gold px-6 py-3 font-medium text-berry transition-transform duration-200 hover:-translate-y-0.5"
        >
          {t("signUp")}
        </Link>
      </FadeIn>
    </section>
  );
}
