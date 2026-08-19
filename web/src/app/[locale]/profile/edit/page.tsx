import { getTranslations, getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "../../navbar";
import Footer from "../../footer";
import EditProfileForm from "./edit-profile-form";

export default async function EditProfilePage() {
  const t = await getTranslations("Profile");
  const locale = await getLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <Navbar
        userEmail={user.email ?? null}
        userId={user.id}
        isEditor={profile?.role === "editor"}
      />
      <div className="flex-1 mx-auto w-full max-w-xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-berry">{t("editProfile")}</h1>
        <EditProfileForm
          userId={user.id}
          displayName={profile?.display_name ?? ""}
          avatarUrl={profile?.avatar_url ?? null}
        />
      </div>

      <Footer />
    </main>
  );
}
