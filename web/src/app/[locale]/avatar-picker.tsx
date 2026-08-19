"use client";

import Image from "next/image";

export default function AvatarPicker({
  preview,
  onChange,
  label,
}: {
  preview: string | null;
  onChange: (file: File | null) => void;
  label: string;
}) {
  return (
    <label
      className={`group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full text-berry/40 ${
        preview
          ? "ring-2 ring-berry/15 hover:ring-berry/30"
          : "border-2 border-dashed border-berry/25 bg-berry/5 hover:border-berry/40"
      }`}
    >
      {preview && (
        <Image src={preview} alt="" fill className="object-cover" />
      )}
      {!preview && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 8a2 2 0 0 1 2-2h1.5l1-1.5h9l1 1.5H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 8a2 2 0 0 1 2-2h1.5l1-1.5h9l1 1.5H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </span>
      <span className="sr-only">{label}</span>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
