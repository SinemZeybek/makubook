"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import LogoutButton from "./logout-button";
import RecipeFilters from "./recipe-filters";

const RIGHT_PAGE_OPEN =
  "M12 6 C12 4 14 3 16 3 L20 3 C20.6 3 21 3.4 21 4 L21 17 C21 17.6 20.6 18 20 18 L16 18 C14 18 12 19 12 21 Z";
const RIGHT_PAGE_TURN =
  "M12 6 C12 4 13 3 14 3 L15 3 C15.3 3 15.5 3.4 15.5 4 L15.5 17 C15.5 17.6 15.3 18 15 18 L14 18 C13 18 12 19 12 21 Z";
const LEFT_PAGE_OPEN =
  "M12 6 C12 4 10 3 8 3 L4 3 C3.4 3 3 3.4 3 4 L3 17 C3 17.6 3.4 18 4 18 L8 18 C10 18 12 19 12 21 Z";
const LEFT_PAGE_TURN =
  "M12 6 C12 4 11 3 10 3 L9 3 C8.7 3 8.5 3.4 8.5 4 L8.5 17 C8.5 17.6 8.7 18 9 18 L10 18 C11 18 12 19 12 21 Z";

const bookIconVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.08, transition: { type: "spring", stiffness: 400, damping: 12 } },
};

const rightPageVariants = {
  rest: { d: RIGHT_PAGE_OPEN },
  hover: {
    d: [RIGHT_PAGE_OPEN, RIGHT_PAGE_TURN, RIGHT_PAGE_OPEN],
    transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
  },
};

const leftPageVariants = {
  rest: { d: LEFT_PAGE_OPEN },
  hover: {
    d: [LEFT_PAGE_OPEN, LEFT_PAGE_TURN, LEFT_PAGE_OPEN],
    transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function Navbar({
  userEmail,
  userId,
  isEditor,
}: {
  userEmail: string | null;
  userId?: string | null;
  isEditor?: boolean;
}) {
  function handleSearchClick() {
    const input = document.getElementById(
      "recipe-search-input"
    ) as HTMLInputElement | null;
    if (!input) return;
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    input.focus();
    input.classList.remove("animate-search-pulse");
    void input.offsetWidth;
    input.classList.add("animate-search-pulse");
    input.addEventListener(
      "animationend",
      () => input.classList.remove("animate-search-pulse"),
      { once: true }
    );
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-cream/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-4">
          <Link href="/" className="group flex items-center gap-1.5">
            <motion.svg
              variants={bookIconVariants}
              initial="rest"
              whileHover="hover"
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gold"
            >
              <motion.path variants={leftPageVariants} />
              <motion.path variants={rightPageVariants} />
            </motion.svg>
            <span className="font-logo text-xl sm:text-2xl">
              <span className="text-gold">Maku</span>
              <span className="text-berry">book</span>
            </span>
          </Link>
          <Link
            href="/about"
            aria-label="About"
            className="group relative flex items-center gap-1.5 rounded-full px-1.5 py-2 text-berry hover:bg-berry/10 sm:px-3"
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
            <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-berry px-2 py-1 text-xs text-cream opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100 sm:hidden">
              About
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-4">
          <button
            onClick={handleSearchClick}
            aria-label="Search recipes"
            className="rounded-full p-1.5 text-berry hover:bg-berry/10 sm:p-2"
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
            <div className="flex items-center gap-1 sm:gap-3">
              <Link
                href="/recipes/new"
                aria-label="Add a recipe"
                className="flex items-center gap-1.5 rounded-full px-1.5 py-2 text-berry hover:bg-berry/10 sm:px-3"
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
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <span className="hidden text-sm sm:inline">Add recipe</span>
              </Link>
              <Link
                href="/saved"
                aria-label="Saved recipes"
                className="flex items-center gap-1.5 rounded-full px-1.5 py-2 text-berry hover:bg-berry/10 sm:px-3"
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
              {isEditor && (
                <Link
                  href="/editor"
                  aria-label="Editor queue"
                  className="flex items-center gap-1.5 rounded-full bg-berry px-1.5 py-1.5 text-sm font-medium text-cream hover:bg-berry-dark sm:px-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3 3 7v5c0 4.5 3.4 8.2 9 10 5.6-1.8 9-5.5 9-10V7l-9-4Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span className="hidden sm:inline">Editor</span>
                </Link>
              )}
              {userId && (
                <Link
                  href={`/profile/${userId}`}
                  aria-label="Your profile"
                  className="flex items-center gap-1.5 rounded-full px-1.5 py-2 text-berry hover:bg-berry/10 sm:px-3"
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
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                  <span className="hidden text-sm sm:inline">Profile</span>
                </Link>
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
                href="/login?mode=sign-up"
                className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-berry"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

        <div className="h-[3px] bg-gradient-to-r from-gold via-berry to-gold" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-4">
        <RecipeFilters />
      </div>
    </>
  );
}
