"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface PostWithProfile {
  id: string;
  title: string;
  category: string;
  urgency: string;
  status: string;
  created_at: string;
  profiles: { first_name: string; last_name: string } | null;
}

export function AdminPostList({ posts }: { posts: PostWithProfile[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(postId: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;

    setDeleting(postId);
    const supabase = createClient();

    // Delete related time_slots and sessions first (cascade should handle it, but be safe)
    await supabase.from("posts").delete().eq("id", postId);

    setDeleting(null);
    router.refresh();
  }

  const statusColors: Record<string, string> = {
    open: "bg-secondary/10 text-secondary",
    matched: "bg-star/10 text-star",
    completed: "bg-primary/10 text-primary",
    closed: "bg-divider text-text-secondary",
  };

  const urgencyColors: Record<string, string> = {
    low: "text-secondary",
    medium: "text-star",
    high: "text-accent",
  };

  if (posts.length === 0) {
    return (
      <Card>
        <p className="text-sm text-text-secondary text-center py-4">
          No posts yet
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="flex items-center justify-between py-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-primary truncate">
                {post.title}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-background rounded text-text-secondary capitalize">
                {post.category}
              </span>
              <span className={`text-xs font-bold capitalize ${urgencyColors[post.urgency]}`}>
                {post.urgency}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusColors[post.status]}`}>
                {post.status}
              </span>
              <span className="text-xs text-text-secondary">
                by {post.profiles ? [post.profiles.first_name, post.profiles.last_name].filter(Boolean).join(" ") : "Unknown"}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleDelete(post.id)}
            disabled={deleting === post.id}
            className="p-2 text-text-secondary hover:text-accent transition-colors shrink-0 disabled:opacity-50"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Card>
      ))}
    </div>
  );
}
