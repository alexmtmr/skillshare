"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Home,
  Compass,
  PlusCircle,
  CalendarCheck,
  Bell,
  User,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, labelKey: "home" },
  { href: "/browse", icon: Compass, labelKey: "browse" },
  { href: "/posts/create", icon: PlusCircle, labelKey: "post" },
  { href: "/sessions", icon: CalendarCheck, labelKey: "sessions" },
  { href: "/notifications", icon: Bell, labelKey: "notifications" },
  { href: "/profile", icon: User, labelKey: "profile" },
];

interface SidebarProps {
  creditsBalance: number;
  unreadCount: number;
  isAdmin: boolean;
}

export function Sidebar({ creditsBalance, unreadCount, isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <aside className="hidden md:flex flex-col w-60 h-full bg-surface border-r border-divider shrink-0">
      <div className="px-8 py-8 flex items-center gap-0.5">
        <Image
          src="/logo.png"
          alt="Skillshare logo"
          width={36}
          height={36}
          className="rounded-lg"
        />
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Skillshare
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = pathname.startsWith(href);
          const showBadge = labelKey === "notifications" && unreadCount > 0;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-semibold ${
                isActive
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-background"
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
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mb-1">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-semibold ${
            pathname.startsWith("/settings")
              ? "bg-primary text-white"
              : "text-text-secondary hover:bg-background"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>{t("settings")}</span>
        </Link>
      </div>

      <div className="p-6">
        <Link href="/credits" className="block">
          <div className="p-4 bg-background rounded-lg hover:bg-divider transition-colors cursor-pointer">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
              Current Balance
            </p>
            <p className="text-xl font-bold text-primary mt-1">
              {creditsBalance} Credits
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
