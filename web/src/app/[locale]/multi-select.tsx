"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Option = { value: string; label: string };

function sameValues(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const bSet = new Set(b);
  return a.every((v) => bSet.has(v));
}

export default function MultiSelect({
  placeholder,
  options,
  selected,
  onChange,
  selectedCountLabel,
  searchPlaceholder,
}: {
  placeholder: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  selectedCountLabel: (count: number) => string;
  searchPlaceholder?: string;
}) {
  const t = useTranslations("Search");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(selected);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) setPending(selected);
  }, [selected, open]);

  function closeAndCommit() {
    setOpen(false);
    if (!sameValues(pending, selected)) {
      onChange(pending);
    }
  }

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeAndCommit();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pending, selected]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  function toggle(value: string) {
    setPending((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  const buttonLabel =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? placeholder)
        : selectedCountLabel(selected.length);

  const filteredOptions = searchPlaceholder
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm ${
          selected.length > 0
            ? "border-berry bg-berry/10 text-berry"
            : "border-berry/20 text-berry"
        }`}
      >
        {buttonLabel}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 opacity-60 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 max-h-72 w-56 overflow-y-auto rounded-md border border-berry/15 bg-white p-2 shadow-lg">
          {searchPlaceholder && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="mb-2 w-full rounded-md border border-berry/20 px-2 py-1.5 text-sm text-berry placeholder:text-berry/40"
            />
          )}
          <div className="flex flex-col gap-0.5">
            {filteredOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm text-berry hover:bg-berry/5"
              >
                <input
                  type="checkbox"
                  checked={pending.includes(option.value)}
                  onChange={() => toggle(option.value)}
                  className="accent-berry"
                />
                {option.label}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={closeAndCommit}
            className="mt-2 w-full rounded-md bg-berry px-2 py-1.5 text-sm text-cream"
          >
            {t("done")}
          </button>
        </div>
      )}
    </div>
  );
}
