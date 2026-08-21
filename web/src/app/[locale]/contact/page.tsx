import { getTranslations } from "next-intl/server";
import Navbar from "../navbar";
import Footer from "../footer";
import ContactForm from "./contact-form";

// No auth check during render (personalization moved to client components),
// so this can be statically cached.
export const revalidate = 300;

export default async function ContactPage() {
  const t = await getTranslations("About");

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-2xl px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-berry">
          {t("contactHeading")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-berry/70">
          {t("contactBody")}
        </p>

        <ContactForm />
      </div>

      <Footer />
    </main>
  );
}
