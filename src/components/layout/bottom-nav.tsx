"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Home,
  Compass,
  PlusCircle,
  Bell,
  User,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, labelKey: "home" },
  { href: "/browse", icon: Compass, labelKey: "browse" },
  { href: "/posts/create", icon: PlusCircle, labelKey: "post" },
  { href: "/notifications", icon: Bell, labelKey: "notifications" },
  { href: "/profile", icon: User, labelKey: "profile" },
  { href: "/settings", icon: Settings, labelKey: "settings" },
];

interface BottomNavProps {
  unreadCount: number;
}

export function BottomNav({ unreadCount }: BottomNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pt-2 pb-6 bg-surface/90 backdrop-blur-md z-50 border-t border-divider">
      {navItems.map(({ href, icon: Icon, labelKey }) => {
        const isActive = pathname.startsWith(href);
        const showBadge = labelKey === "notifications" && unreadCount > 0;

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg transition-colors ${
              isActive
                ? "bg-primary text-white"
                : "text-text-secondary"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {showBadge && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold mt-0.5">
              {t(labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
