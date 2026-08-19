import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const DOMAINS = {
  en: "https://makubook.com",
  fi: "https://makubook.fi",
};

const STATIC_PATHS = ["", "/about", "/search", "/contact", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, created_at")
    .eq("status", "published");

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${DOMAINS.en}${path}`,
    alternates: {
      languages: {
        en: `${DOMAINS.en}${path}`,
        fi: `${DOMAINS.fi}${path}`,
      },
    },
    changeFrequency: path === "" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  for (const recipe of recipes ?? []) {
    const path = `/recipes/${recipe.id}`;
    entries.push({
      url: `${DOMAINS.en}${path}`,
      lastModified: recipe.created_at ? new Date(recipe.created_at) : undefined,
      alternates: {
        languages: {
          en: `${DOMAINS.en}${path}`,
          fi: `${DOMAINS.fi}${path}`,
        },
      },
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return entries;
}
