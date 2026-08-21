import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Navbar from "../navbar";
import Footer from "../footer";

// No auth check during render (personalization moved to client components),
// so this can be statically cached.
export const revalidate = 300;

export default async function TermsPage() {
  const t = await getTranslations("Terms");

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-berry">{t("title")}</h1>
        <p className="mt-2 text-sm text-berry/60">{t("lastUpdated")}</p>

        <div className="mt-8 space-y-8 text-berry/80">
          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("acceptanceHeading")}
            </h2>
            <p className="mt-2">{t("acceptanceBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("eligibilityHeading")}
            </h2>
            <p className="mt-2">{t("eligibilityBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("accountHeading")}
            </h2>
            <p className="mt-2">{t("accountBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("contentHeading")}
            </h2>
            <p className="mt-2">{t("contentBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("moderationHeading")}
            </h2>
            <p className="mt-2">{t("moderationBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("foodSafetyHeading")}
            </h2>
            <p className="mt-2">{t("foodSafetyBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("prohibitedHeading")}
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>{t("prohibitedItem1")}</li>
              <li>{t("prohibitedItem2")}</li>
              <li>{t("prohibitedItem3")}</li>
              <li>{t("prohibitedItem4")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("terminationHeading")}
            </h2>
            <p className="mt-2">{t("terminationBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("disclaimerHeading")}
            </h2>
            <p className="mt-2">{t("disclaimerBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("lawHeading")}
            </h2>
            <p className="mt-2">{t("lawBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-berry">
              {t("changesHeading")}
            </h2>
            <p className="mt-2">
              {t("changesBodyPrefix")}{" "}
              <Link href="/contact" className="underline hover:text-berry">
                {t("contactUsHere")}
              </Link>
              .
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
