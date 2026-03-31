import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { BrowseFeed } from "./browse-feed";

export default async function BrowsePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all open posts (filtering happens client-side)
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(name, rating_avg, avatar_url)")
    .eq("status", "open")
    .neq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <TopBar title="Browse Problems" />
      <div className="p-6 md:p-10 flex-1 flex flex-col items-center">
        <BrowseFeed posts={posts ?? []} userId={user.id} />
      </div>
    </>
  );
}
