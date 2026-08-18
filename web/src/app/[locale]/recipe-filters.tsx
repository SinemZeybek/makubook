"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES } from "@/lib/countries";
import { MEAL_TYPES } from "@/lib/mealTypes";

export default function RecipeFilters() {
  const t = useTranslations("Search");
  const tMeal = useTranslations("MealTypes");
  const tCountry = useTranslations("Countries");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("recipes")
      .select("country")
      .eq("status", "published")
      .then(({ data }) => {
        if (!data) return;
        const countriesInUse = new Set(
          data.map((recipe) => recipe.country).filter(Boolean)
        );
        setAvailableCountries(
          COUNTRIES.filter((c) => countriesInUse.has(c)).sort((a, b) =>
            tCountry(a).localeCompare(tCountry(b))
          )
        );
      });
  }, [tCountry]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname, {
      scroll: false,
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", search);
  }

  const hasActiveFilters =
    searchParams.get("q") ||
    searchParams.get("country") ||
    searchParams.get("mealType") ||
    searchParams.get("language") ||
    searchParams.get("servings");

  return (
    <div className="mt-6 flex flex-col gap-3">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          id="recipe-search-input"
          type="text"
          placeholder={t("placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-berry/20 px-3 py-2 text-sm text-berry placeholder:text-berry/40"
        />
        <button
          type="submit"
          className="rounded-md border border-berry/20 px-3 py-2 text-sm text-berry hover:bg-berry/10"
        >
          {t("search")}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={searchParams.get("country") ?? ""}
          onChange={(e) => updateParam("country", e.target.value)}
          className="rounded-md border border-berry/20 px-2 py-1.5 text-sm text-berry"
        >
          <option value="">{t("allCountries")}</option>
          {availableCountries.map((c) => (
            <option key={c} value={c}>
              {tCountry(c)}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("mealType") ?? ""}
          onChange={(e) => updateParam("mealType", e.target.value)}
          className="rounded-md border border-berry/20 px-2 py-1.5 text-sm text-berry"
        >
          <option value="">{t("allMealTypes")}</option>
          {MEAL_TYPES.map((m) => (
            <option key={m} value={m}>
              {tMeal(m)}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("language") ?? ""}
          onChange={(e) => updateParam("language", e.target.value)}
          className="rounded-md border border-berry/20 px-2 py-1.5 text-sm text-berry"
        >
          <option value="">{t("allLanguages")}</option>
          <option value="fi">{t("finnish")}</option>
          <option value="en">{t("english")}</option>
        </select>

        <select
          value={searchParams.get("servings") ?? ""}
          onChange={(e) => updateParam("servings", e.target.value)}
          className="rounded-md border border-berry/20 px-2 py-1.5 text-sm text-berry"
        >
          <option value="">{t("anyServings")}</option>
          <option value="1-2">{t("servings1to2")}</option>
          <option value="3-4">{t("servings3to4")}</option>
          <option value="5-6">{t("servings5to6")}</option>
          <option value="7+">{t("servings7plus")}</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              router.push(pathname, { scroll: false });
            }}
            className="text-sm text-berry/70 underline"
          >
            {t("clearFilters")}
          </button>
        )}
      </div>
    </div>
  );
}
