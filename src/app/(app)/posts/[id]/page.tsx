import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { PostDetailClient } from "./post-detail-client";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles(name, rating_avg, avatar_url, created_at)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const { data: timeSlots } = await supabase
    .from("time_slots")
    .select("*")
    .eq("post_id", id)
    .eq("status", "available")
    .order("date", { ascending: true });

  const isOwner = post.user_id === user.id;

  // Check if current user (giver) already has a pending/accepted request for this post
  let existingRequest = null;
  if (!isOwner) {
    const { data } = await supabase
      .from("connection_requests")
      .select("*")
      .eq("post_id", id)
      .eq("giver_id", user.id)
      .maybeSingle();
    existingRequest = data;
  }

  // If owner, fetch pending connection requests with giver profiles
  let pendingRequests: Array<{
    id: string;
    giver_id: string;
    timeslot_id: string;
    message: string | null;
    status: string;
    created_at: string;
    profiles: { name: string; rating_avg: number; avatar_url: string | null; skills: string[] };
    time_slots: { date: string; start_time: string; end_time: string };
  }> = [];

  if (isOwner) {
    const { data } = await supabase
      .from("connection_requests")
      .select("*, profiles!connection_requests_giver_id_fkey(name, rating_avg, avatar_url, skills), time_slots(date, start_time, end_time)")
      .eq("post_id", id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    pendingRequests = (data ?? []) as typeof pendingRequests;
  }

  return (
    <>
      <TopBar title="Problem Detail" />
      <PostDetailClient
        post={post}
        timeSlots={timeSlots ?? []}
        userId={user.id}
        isOwner={isOwner}
        existingRequest={existingRequest}
        pendingRequests={pendingRequests}
      />
    </>
  );
}
