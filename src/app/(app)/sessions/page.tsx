import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Star, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default async function SessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, posts(title, category), profiles!sessions_giver_id_fkey(first_name, last_name), seeker:profiles!sessions_seeker_id_fkey(first_name, last_name)")
    .or(`seeker_id.eq.${user.id},giver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // Separate into upcoming and past
  const upcoming = sessions?.filter((s) => s.status === "scheduled" || s.status === "in_progress") ?? [];
  const past = sessions?.filter((s) => s.status === "completed" || s.status === "cancelled") ?? [];

  const statusIcons: Record<string, typeof CheckCircle> = {
    scheduled: Calendar,
    in_progress: Clock,
    completed: CheckCircle,
    cancelled: XCircle,
  };

  const statusColors: Record<string, string> = {
    scheduled: "text-secondary bg-secondary/10",
    in_progress: "text-star bg-star/10",
    completed: "text-secondary bg-secondary/10",
    cancelled: "text-accent bg-accent/10",
  };

  function renderSession(session: (typeof sessions extends (infer T)[] | null ? T : never)) {
    if (!session) return null;
    const StatusIcon = statusIcons[session.status] || Calendar;
    const isSeeker = session.seeker_id === user!.id;
    const otherProfile = isSeeker
      ? (session.profiles as { first_name: string; last_name: string } | null)
      : (session.seeker as { first_name: string; last_name: string } | null);
    const otherName = otherProfile
      ? [otherProfile.first_name, otherProfile.last_name].filter(Boolean).join(" ")
      : null;

    return (
      <Link key={session.id} href={`/sessions/${session.id}`}>
        <Card className="hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${statusColors[session.status]}`}>
              <StatusIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-primary">
                {(session.posts as { title: string } | null)?.title ?? "Session"}
              </p>
              <p className="text-xs text-text-secondary">
                with {otherName ?? "Unknown"} · {isSeeker ? "You need help" : "You're helping"}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${statusColors[session.status]}`}>
            {session.status.replace("_", " ")}
          </span>
        </Card>
      </Link>
    );
  }

  return (
    <>
      <TopBar title="Sessions" />
      <div className="p-6 md:p-10 max-w-3xl mx-auto w-full space-y-8">
        {/* Upcoming */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
            Upcoming Sessions
          </h3>
          {upcoming.length > 0 ? (
            <div className="space-y-2">{upcoming.map(renderSession)}</div>
          ) : (
            <Card>
              <p className="text-sm text-text-secondary text-center py-4">
                No upcoming sessions
              </p>
            </Card>
          )}
        </div>

        {/* Past */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
            Past Sessions
          </h3>
          {past.length > 0 ? (
            <div className="space-y-2">{past.map(renderSession)}</div>
          ) : (
            <Card>
              <p className="text-sm text-text-secondary text-center py-4">
                No past sessions yet
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
