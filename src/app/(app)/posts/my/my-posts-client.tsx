"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { XCircle, Trash2 } from "lucide-react";
import type { Post, PostStatus } from "@/lib/types";

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

const ALL_STATUSES: PostStatus[] = ["open", "matched", "completed", "closed"];

export function MyPostsClient({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<PostStatus | "all">("all");
  const [actionId, setActionId] = useState<string | null>(null);

  const filteredPosts =
    filterStatus === "all"
      ? posts
      : posts.filter((p) => p.status === filterStatus);

  async function handleClose(postId: string) {
    if (!confirm("Close this post?")) return;
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
    if (!confirm("Delete this post permanently?")) return;
    setActionId(postId);
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", postId);
    setActionId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
            filterStatus === "all"
              ? "border-secondary bg-secondary/10 text-secondary"
              : "border-divider text-text-secondary hover:border-text-secondary"
          }`}
        >
          All ({posts.length})
        </button>
        {ALL_STATUSES.map((s) => {
          const count = posts.filter((p) => p.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all border ${
                filterStatus === s
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-divider text-text-secondary hover:border-text-secondary"
              }`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Posts list */}
      {filteredPosts.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-sm text-text-secondary">
            No posts with this status.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="flex items-center justify-between py-3"
            >
              <div className="flex-1 min-w-0">
                <Link href={`/posts/${post.id}`}>
                  <p className="text-sm font-semibold text-primary truncate hover:underline">
                    {post.title}
                  </p>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-background rounded text-text-secondary capitalize">
                    {post.category}
                  </span>
                  <span
                    className={`text-xs font-bold capitalize ${urgencyColors[post.urgency]}`}
                  >
                    {post.urgency}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusColors[post.status]}`}
                  >
                    {post.status}
                  </span>
                </div>
              </div>
              {post.status === "open" && (
                <div className="flex items-center gap-1 shrink-0 ml-2">
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
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
