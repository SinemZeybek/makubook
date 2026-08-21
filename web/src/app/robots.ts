import type { MetadataRoute } from "next";

const DISALLOWED_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/saved",
  "/profile/edit",
  "/recipes/new",
  "/recipes/*/edit",
  "/editor",
  "/api/",
  "/auth/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
      // AI-training crawlers were responsible for ~99.8% of edge requests
      // in a 12h window (ClaudeBot 299K, GPTBot 163K, ~0% cache hit rate),
      // which is what actually blew through the Vercel/Supabase free-tier
      // caps — not real traffic. Blocking outright rather than rate-limiting,
      // since there's no benefit to Makubook from being crawled for training.
      {
        userAgent: ["ClaudeBot", "GPTBot"],
        disallow: "/",
      },
    ],
    sitemap: "https://makubook.com/sitemap.xml",
  };
}
