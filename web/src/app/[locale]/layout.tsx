import type { Metadata } from "next";
import { Geist, Geist_Mono, DynaPuff } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dynaPuff = DynaPuff({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: "700",
});

export const metadata: Metadata = {
  title: "Makubook",
  description: "Recipes from every home, shared with the world.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${dynaPuff.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-20 sm:pb-0">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
