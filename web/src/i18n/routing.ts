import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fi"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  domains: [
    {
      domain: "makubook.com",
      defaultLocale: "en",
      locales: ["en"],
    },
    {
      domain: "makubook.fi",
      defaultLocale: "fi",
      locales: ["fi"],
    },
  ],
});
