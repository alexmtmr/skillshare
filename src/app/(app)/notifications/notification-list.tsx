"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import {
  HandHelping,
  CheckCircle,
  XCircle,
  Calendar,
  Star,
  Coins,
  CreditCard,
  Bell,
  X,
} from "lucide-react";
import type { Notification } from "@/lib/types";

const typeConfig: Record<
  string,
  { icon: typeof Bell; color: string }
> = {
  connection_request: { icon: HandHelping, color: "text-secondary" },
  request_accepted: { icon: CheckCircle, color: "text-secondary" },
  request_declined: { icon: XCircle, color: "text-accent" },
  session_confirmed: { icon: Calendar, color: "text-secondary" },
  session_cancelled: { icon: X, color: "text-accent" },
  session_reminder: { icon: Calendar, color: "text-star" },
  rating_received: { icon: Star, color: "text-star" },
  credits_earned: { icon: Coins, color: "text-secondary" },
  credits_purchased: { icon: CreditCard, color: "text-primary" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const router = useRouter();

  async function markAsRead(id: string) {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    router.refresh();
  }

  async function markAllAsRead() {
    const supabase = createClient();
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);
    router.refresh();
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-secondary">
            {unreadCount} unread
          </p>
          <button
            onClick={markAllAsRead}
            className="text-xs text-secondary font-medium hover:underline"
          >
            Mark all as read
          </button>
        </div>
      )}

      {notifications.map((notification) => {
        const config = typeConfig[notification.type] || {
          icon: Bell,
          color: "text-text-secondary",
        };
        const Icon = config.icon;

        return (
          <Card
            key={notification.id}
            className={`cursor-pointer transition-colors ${
              !notification.read
                ? "border-l-4 border-l-secondary bg-secondary/[0.02]"
                : ""
            }`}
          >
            <button
              onClick={() => {
                if (!notification.read) markAsRead(notification.id);
                // Navigate based on notification data
                const data = notification.data as Record<string, string> | null;
                if (data?.post_id) {
                  router.push(`/posts/${data.post_id}`);
                } else if (data?.session_id) {
                  router.push(`/sessions/${data.session_id}`);
                }
              }}
              className="w-full text-left flex items-start gap-3"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${config.color} bg-current/10`}
                style={{
                  backgroundColor: `color-mix(in srgb, currentColor 10%, transparent)`,
                }}
              >
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    !notification.read
                      ? "font-semibold text-primary"
                      : "text-text-primary"
                  }`}
                >
                  {notification.title}
                </p>
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-[10px] text-text-secondary mt-1">
                  {timeAgo(notification.created_at)}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-2" />
              )}
            </button>
          </Card>
        );
      })}
    </div>
  );
}
