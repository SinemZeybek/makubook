import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
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
      ],
    },
    sitemap: "https://makubook.com/sitemap.xml",
  };
}
