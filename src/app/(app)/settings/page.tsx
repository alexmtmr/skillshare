import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { SettingsClient } from "./settings-client";
import { cookies } from "next/headers";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const currentLocale = cookieStore.get("locale")?.value || "en";

  return (
    <>
      <TopBar title="Settings" />
      <SettingsClient userId={user.id} currentLocale={currentLocale} />
    </>
  );
}
