"use client";

import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  credits_balance: number;
  rating_avg: number;
  skills: string[];
  created_at: string;
}

export function AdminUserList({ users }: { users: UserProfile[] }) {
  if (users.length === 0) {
    return (
      <Card>
        <p className="text-sm text-text-secondary text-center py-4">
          No users yet
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <Card key={user.id} className="flex items-center justify-between py-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">
                  {user.first_name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">
                  {[user.first_name, user.last_name].filter(Boolean).join(" ") || "No name"}
                </p>
                <p className="text-xs text-text-secondary">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-xs font-bold text-primary">
                {user.credits_balance} credits
              </p>
              <div className="flex items-center gap-1 justify-end">
                <Star className="w-3 h-3 text-star fill-star" />
                <span className="text-xs text-text-secondary">
                  {Number(user.rating_avg).toFixed(1)}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-1 bg-background rounded capitalize">
              {user.role}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
