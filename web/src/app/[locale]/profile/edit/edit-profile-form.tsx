"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import AvatarPicker from "../../avatar-picker";

export default function EditProfileForm({
  userId,
  displayName: initialDisplayName,
  avatarUrl,
  birthday: initialBirthday,
}: {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  birthday: string;
}) {
  const t = useTranslations("EditProfile");
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [birthday, setBirthday] = useState(initialBirthday);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleAvatarChange(file: File | null) {
    setAvatar(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    let newAvatarUrl = avatarUrl;

    if (avatar) {
      const extension = avatar.name.split(".").pop();
      const path = `${userId}/avatar.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatar, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      newAvatarUrl = `${publicUrl}?t=${Date.now()}`;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        avatar_url: newAvatarUrl,
        birthday: birthday || null,
      })
      .eq("id", userId);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push(`/profile/${userId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <AvatarPicker
          preview={preview || "/default-avatar.png"}
          onChange={handleAvatarChange}
          label={t("profilePicture")}
        />
        <p className="text-sm text-berry/60">{t("profilePicture")}</p>
      </div>

      <label className="flex flex-col gap-1 text-sm text-berry/70">
        {t("displayName")}
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="rounded-md border border-berry/20 px-3 py-2 text-berry placeholder:text-berry/40"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-berry/70">
        {t("birthday")}
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className="rounded-md border border-berry/20 px-3 py-2 text-berry"
        />
        <span className="text-xs text-berry/50">{t("birthdayNotPublic")}</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-gold px-3 py-2 font-medium text-berry disabled:opacity-50"
      >
        {loading ? t("saving") : t("saveChanges")}
      </button>
    </form>
  );
}
