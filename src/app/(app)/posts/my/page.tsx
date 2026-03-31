import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { MyPostsClient } from "./my-posts-client";

export default async function MyPostsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <TopBar title="My Posts" />
      <div className="p-6 md:p-10 max-w-3xl mx-auto w-full space-y-4">
        {posts && posts.length > 0 ? (
          <MyPostsClient posts={posts} />
        ) : (
          <Card className="text-center py-12">
            <FileText className="w-10 h-10 text-divider mx-auto mb-3" />
            <p className="text-sm text-text-secondary">
              You haven&apos;t created any posts yet.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
