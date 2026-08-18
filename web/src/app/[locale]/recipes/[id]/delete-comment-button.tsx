"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteCommentButton({
  commentId,
}: {
  commentId: string;
}) {
  const t = useTranslations("Comment");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm(t("confirmDelete"))) {
      return;
    }

    setLoading(true);
    const supabase = createClient();
    await supabase.from("comments").delete().eq("id", commentId);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="ml-auto text-xs text-berry/40 hover:text-red-600 disabled:opacity-50"
    >
      {loading ? t("deleting") : t("delete")}
    </button>
  );
}
