import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Navbar from "../navbar";
import Footer from "../footer";

// No auth check during render (personalization moved to client components),
// so this can be statically cached.
export const revalidate = 300;

export default async function PrivacyPage() {
  const t = await getTranslations("Privacy");

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-berry">{t("title")}</h1>
        <p className="mt-2 text-sm text-berry/60">{t("lastUpdated")}</p>

        <div className="mt-8 space-y-8 text-berry/80">
          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("whoWeAreHeading")}
            </h2>
            <p className="mt-2">
              {t("whoWeAreBodyPrefix")}{" "}
              <Link href="/contact" className="underline hover:text-berry">
                {t("getInTouchHere")}
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("whatDataHeading")}
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>{t("accountInfoLabel")}</strong> {t("accountInfoBody")}
              </li>
              <li>
                <strong>{t("contentLabel")}</strong> {t("contentBody")}
              </li>
              <li>
                <strong>{t("savedLabel")}</strong> {t("savedBody")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("whyHeading")}
            </h2>
            <p className="mt-2">{t("whyBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("whereHeading")}
            </h2>
            <p className="mt-2">{t("whereBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("cookiesHeading")}
            </h2>
            <p className="mt-2">{t("cookiesBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("rightsHeading")}
            </h2>
            <p className="mt-2">
              {t("rightsBodyPrefix")}{" "}
              <Link href="/contact" className="underline hover:text-berry">
                {t("contactUsHere")}
              </Link>{" "}
              {t("rightsBodySuffix")}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("changesHeading")}
            </h2>
            <p className="mt-2">{t("changesBody")}</p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
