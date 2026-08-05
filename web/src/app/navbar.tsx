"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";
import RecipeFilters from "./recipe-filters";

export default function Navbar({ userEmail }: { userEmail: string | null }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="sticky top-0 z-10 border-b border-berry/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="font-logo text-2xl">
          <span className="text-gold">Maku</span>
          <span className="text-berry">book</span>
        </span>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen((open) => !open)}
            aria-label="Search recipes"
            className="rounded-full p-2 text-berry hover:bg-berry/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          {userEmail ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-berry/70 sm:inline">
                {userEmail}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-berry underline underline-offset-2"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-berry"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="mx-auto max-w-6xl px-6 pb-4">
          <RecipeFilters />
        </div>
      )}
    </div>
  );
}
