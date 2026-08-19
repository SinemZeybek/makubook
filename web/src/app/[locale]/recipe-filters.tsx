"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES } from "@/lib/countries";
import { MEAL_TYPES } from "@/lib/mealTypes";
import MultiSelect from "./multi-select";

function parseParam(value: string | null) {
  return value ? value.split(",") : [];
}

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

  function updateParam(key: string, values: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length > 0) {
      params.set(key, values.join(","));
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname, {
      scroll: false,
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("q", search);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname, {
      scroll: false,
    });
  }

  const selectedCountries = parseParam(searchParams.get("country"));
  const selectedMealTypes = parseParam(searchParams.get("mealType"));
  const selectedLanguages = parseParam(searchParams.get("language"));
  const selectedServings = parseParam(searchParams.get("servings"));

  const hasActiveFilters =
    searchParams.get("q") ||
    selectedCountries.length > 0 ||
    selectedMealTypes.length > 0 ||
    selectedLanguages.length > 0 ||
    selectedServings.length > 0;

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <form onSubmit={handleSearchSubmit} className="flex w-full max-w-xl gap-2">
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
        <MultiSelect
          placeholder={t("allCountries")}
          options={availableCountries.map((c) => ({
            value: c,
            label: tCountry(c),
          }))}
          selected={selectedCountries}
          onChange={(values) => updateParam("country", values)}
          searchPlaceholder={t("searchCountries")}
        />

        <MultiSelect
          placeholder={t("allMealTypes")}
          options={MEAL_TYPES.map((m) => ({ value: m, label: tMeal(m) }))}
          selected={selectedMealTypes}
          onChange={(values) => updateParam("mealType", values)}
        />

        <MultiSelect
          placeholder={t("allLanguages")}
          options={[
            { value: "fi", label: t("finnish") },
            { value: "en", label: t("english") },
          ]}
          selected={selectedLanguages}
          onChange={(values) => updateParam("language", values)}
        />

        <MultiSelect
          placeholder={t("anyServings")}
          options={[
            { value: "1-2", label: t("servings1to2") },
            { value: "3-4", label: t("servings3to4") },
            { value: "5-6", label: t("servings5to6") },
            { value: "7+", label: t("servings7plus") },
          ]}
          selected={selectedServings}
          onChange={(values) => updateParam("servings", values)}
        />

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
