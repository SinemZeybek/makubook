import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="mt-16 border-t border-berry/10 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <Link href="/" className="font-logo text-xl">
          <span className="text-gold">Maku</span>
          <span className="text-berry">book</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm text-berry/70">
          <Link href="/about" className="hover:text-berry hover:underline">
            {t("about")}
          </Link>
          <Link href="/contact" className="hover:text-berry hover:underline">
            {t("contact")}
          </Link>
        </nav>
      </div>

      <div className="flex flex-col items-center gap-2 border-t border-berry/10 py-4 text-center text-xs text-berry/50">
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
        <Link href="/privacy" className="hover:text-berry hover:underline">
          {t("privacy")}
        </Link>
      </div>
    </footer>
  );
}
