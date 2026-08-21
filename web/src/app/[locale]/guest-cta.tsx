"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCurrentUser } from "@/lib/useCurrentUser";
import FadeIn from "./fade-in";

export default function GuestCta() {
  const t = useTranslations("Home");
  const { user, loading } = useCurrentUser();

  if (loading || user) return null;

  return (
    <FadeIn className="mt-16 rounded-lg bg-berry px-6 py-10 text-center">
      <h2 className="font-logo text-2xl text-cream">{t("ctaHeading")}</h2>
      <Link
        href="/login?mode=sign-up"
        className="mt-5 inline-block rounded-md bg-gold px-5 py-2.5 font-medium text-berry"
      >
        {t("signUp")}
      </Link>
    </FadeIn>
  );
}
