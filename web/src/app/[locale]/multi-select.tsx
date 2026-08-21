"use client";

import { useEffect, useRef, useState } from "react";

type Option = { value: string; label: string };

export default function MultiSelect({
  placeholder,
  options,
  selected,
  onChange,
  searchPlaceholder,
}: {
  placeholder: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [alignRight, setAlignRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selected);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  function handleToggle() {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setAlignRight(rect.left + 224 > window.innerWidth - 16);
    }
    setOpen((v) => !v);
    if (open) setSearch("");
  }

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function toggle(value: string) {
    const current = selectedRef.current;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    selectedRef.current = next;
    onChange(next);
  }

  const filteredOptions = searchPlaceholder
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm ${
          selected.length > 0
            ? "border-berry bg-berry/10 text-berry"
            : "border-berry/20 text-berry"
        }`}
      >
        {placeholder}
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
        <div
          className={`absolute top-full z-20 mt-1 max-h-72 w-56 overflow-y-auto rounded-md border border-berry/15 bg-white p-2 shadow-lg ${
            alignRight ? "right-0" : "left-0"
          }`}
        >
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
                  checked={selected.includes(option.value)}
                  onChange={() => toggle(option.value)}
                  className="accent-berry"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
