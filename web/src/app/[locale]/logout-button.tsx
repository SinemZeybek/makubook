"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton({
  variant = "navbar",
}: {
  variant?: "navbar" | "pill";
}) {
  const t = useTranslations("Logout");
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (variant === "pill") {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 rounded-full border border-berry/20 px-4 py-2 text-sm font-medium text-berry transition-all duration-200 hover:-translate-y-0.5 hover:bg-berry/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        {t("logOut")}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      aria-label={t("logOut")}
      className="flex items-center gap-1.5 rounded-full px-1.5 py-2 text-berry/70 hover:bg-berry/10 hover:text-berry sm:px-1"
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
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span className="hidden text-sm underline sm:inline">{t("logOut")}</span>
    </button>
  );
}
