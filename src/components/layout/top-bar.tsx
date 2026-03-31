"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Shield } from "lucide-react";
import { useAppContext } from "./app-context";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const router = useRouter();
  const { isAdmin } = useAppContext();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 w-full h-16 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 md:px-10 z-40 border-b border-divider/50">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-primary">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-text-secondary">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link
            href="/admin"
            className="p-2 rounded-lg text-text-secondary hover:bg-background transition-colors"
            title="Admin Panel"
          >
            <Shield className="w-5 h-5" />
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-text-secondary hover:bg-background transition-colors"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
