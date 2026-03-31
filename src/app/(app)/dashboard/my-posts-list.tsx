"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { XCircle, Trash2 } from "lucide-react";
import type { Post } from "@/lib/types";

export function MyPostsList({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [actionId, setActionId] = useState<string | null>(null);

  async function handleClose(postId: string) {
    if (!confirm("Close this post? It will no longer appear in browse."))
      return;
    setActionId(postId);
    const supabase = createClient();
    await supabase
      .from("posts")
      .update({ status: "closed" })
      .eq("id", postId);
    setActionId(null);
    router.refresh();
  }

  async function handleDelete(postId: string) {
    if (!confirm("Delete this post permanently? This cannot be undone."))
      return;
    setActionId(postId);
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", postId);
    setActionId(null);
    router.refresh();
  }

  if (posts.length === 0) {
    return (
      <Card>
        <p className="text-sm text-text-secondary text-center py-4">
          No open posts yet. Create one to get help!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Card key={post.id} className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <Link href={`/posts/${post.id}`}>
              <p className="font-semibold text-sm text-primary hover:underline">
                {post.title}
              </p>
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-background rounded text-text-secondary capitalize">
                {post.category}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  post.urgency === "high"
                    ? "bg-accent/10 text-accent"
                    : post.urgency === "medium"
                      ? "bg-star/10 text-star"
                      : "bg-secondary/10 text-secondary"
                }`}
              >
                {post.urgency}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleClose(post.id)}
              disabled={actionId === post.id}
              className="p-1.5 text-text-secondary hover:text-star transition-colors disabled:opacity-50"
              title="Close post"
            >
              <XCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(post.id)}
              disabled={actionId === post.id}
              className="p-1.5 text-text-secondary hover:text-accent transition-colors disabled:opacity-50"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Link
              href={`/posts/${post.id}`}
              className="text-xs font-bold text-secondary hover:underline ml-1"
            >
              View
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
