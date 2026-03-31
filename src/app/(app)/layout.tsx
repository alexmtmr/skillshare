import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AppProvider } from "@/components/layout/app-context";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_balance, is_admin")
    .eq("id", user.id)
    .single();

  const creditsBalance = profile?.credits_balance ?? 0;
  const isAdmin = profile?.is_admin ?? false;

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return (
    <AppProvider isAdmin={isAdmin}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar creditsBalance={creditsBalance} unreadCount={unreadCount ?? 0} isAdmin={isAdmin} />
        <main className="flex-1 flex flex-col h-full overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav unreadCount={unreadCount ?? 0} />
      </div>
    </AppProvider>
  );
}
