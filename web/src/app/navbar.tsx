"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";
import RecipeFilters from "./recipe-filters";

export default function Navbar({
  userEmail,
  userId,
}: {
  userEmail: string | null;
  userId?: string | null;
}) {
  const [searchOpen, setSearchOpen] = useState(true);

  return (
    <div className="sticky top-0 z-10 border-b border-berry/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-logo text-2xl">
          <span className="text-gold">Maku</span>
          <span className="text-berry">book</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/about"
            aria-label="About"
            className="flex items-center gap-1.5 rounded-full px-2 py-2 text-berry hover:bg-berry/10 sm:px-3"
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
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span className="hidden text-sm sm:inline">About</span>
          </Link>
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
              <Link
                href="/saved"
                aria-label="Saved recipes"
                className="flex items-center gap-1.5 rounded-full px-2 py-2 text-berry hover:bg-berry/10 sm:px-3"
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
                  <path d="M6 3.5h12a.5.5 0 0 1 .5.5v17l-6.5-4-6.5 4V4a.5.5 0 0 1 .5-.5Z" />
                </svg>
                <span className="hidden text-sm sm:inline">Saved</span>
              </Link>
              {userId ? (
                <Link
                  href={`/profile/${userId}`}
                  aria-label="Your profile"
                  className="flex items-center gap-1.5 rounded-full px-2 py-2 text-berry/70 hover:bg-berry/10 sm:px-1"
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
                    className="sm:hidden"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                  <span className="hidden text-sm underline underline-offset-2 sm:inline">
                    {userEmail}
                  </span>
                </Link>
              ) : (
                <span className="hidden text-sm text-berry/70 sm:inline">
                  {userEmail}
                </span>
              )}
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
