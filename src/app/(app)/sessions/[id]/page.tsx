import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { SessionClient } from "./session-client";

export default async function SessionPage({
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

  const { data: session } = await supabase
    .from("sessions")
    .select("*, posts(title, category, description)")
    .eq("id", id)
    .single();

  if (!session) notFound();

  // Check user is a participant
  if (session.seeker_id !== user.id && session.giver_id !== user.id) {
    redirect("/dashboard");
  }

  // Get the other person's profile
  const otherId =
    session.seeker_id === user.id ? session.giver_id : session.seeker_id;
  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("name, avatar_url")
    .eq("id", otherId)
    .single();

  // Check if rating already exists
  const { data: existingRating } = await supabase
    .from("ratings")
    .select("id")
    .eq("session_id", id)
    .eq("rater_id", user.id)
    .single();

  const isSeeker = session.seeker_id === user.id;

  return (
    <>
      <TopBar title="Session" />
      <SessionClient
        session={session}
        otherName={otherProfile?.name ?? "Unknown"}
        isSeeker={isSeeker}
        userId={user.id}
        hasRated={!!existingRating}
      />
    </>
  );
}
