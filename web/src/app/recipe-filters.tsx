"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES } from "@/lib/countries";
import { MEAL_TYPES } from "@/lib/mealTypes";

export default function RecipeFilters() {
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
      .then(({ data }) => {
        if (!data) return;
        const countriesInUse = new Set(
          data.map((recipe) => recipe.country).filter(Boolean)
        );
        setAvailableCountries(
          COUNTRIES.filter((c) => countriesInUse.has(c))
        );
      });
  }, []);

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
    searchParams.get("language");

  return (
    <div className="mt-6 flex flex-col gap-3">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-berry/20 px-3 py-2 text-sm text-berry placeholder:text-berry/40"
        />
        <button
          type="submit"
          className="rounded-md border border-berry/20 px-3 py-2 text-sm text-berry hover:bg-berry/10"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={searchParams.get("country") ?? ""}
          onChange={(e) => updateParam("country", e.target.value)}
          className="rounded-md border border-berry/20 px-2 py-1.5 text-sm text-berry"
        >
          <option value="">All countries</option>
          {availableCountries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("mealType") ?? ""}
          onChange={(e) => updateParam("mealType", e.target.value)}
          className="rounded-md border border-berry/20 px-2 py-1.5 text-sm text-berry"
        >
          <option value="">All meal types</option>
          {MEAL_TYPES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("language") ?? ""}
          onChange={(e) => updateParam("language", e.target.value)}
          className="rounded-md border border-berry/20 px-2 py-1.5 text-sm text-berry"
        >
          <option value="">All languages</option>
          <option value="fi">Finnish</option>
          <option value="en">English</option>
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
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
