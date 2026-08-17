import Link from "next/link";

const CONTACT_EMAIL = "sinemzpeltokangas.dev@gmail.com";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-berry/10 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <Link href="/" className="font-logo text-xl">
          <span className="text-gold">Maku</span>
          <span className="text-berry">book</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm text-berry/70">
          <Link href="/about" className="hover:text-berry hover:underline">
            About
          </Link>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="hover:text-berry hover:underline"
          >
            Contact us
          </a>
        </nav>
      </div>

      <div className="border-t border-berry/10 py-4 text-center text-xs text-berry/50">
        © {new Date().getFullYear()} Makubook
      </div>
    </footer>
  );
}
