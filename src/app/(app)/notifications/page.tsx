import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { NotificationList } from "./notification-list";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <TopBar title="Notifications" />
      <div className="p-6 md:p-10 max-w-3xl mx-auto w-full space-y-4">
        {notifications && notifications.length > 0 ? (
          <NotificationList notifications={notifications} />
        ) : (
          <Card>
            <div className="text-center py-8 space-y-3">
              <Bell className="w-10 h-10 text-divider mx-auto" />
              <p className="text-sm text-text-secondary">
                No notifications yet
              </p>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
