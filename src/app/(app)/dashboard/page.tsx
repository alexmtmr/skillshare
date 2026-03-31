import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import {
  Coins,
  Calendar,
  PlusCircle,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  HandHelping,
  Star,
} from "lucide-react";
import Link from "next/link";
import { MyPostsList } from "./my-posts-list";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: upcomingSessions } = await supabase
    .from("sessions")
    .select("*, posts(title, category)")
    .or(`seeker_id.eq.${user.id},giver_id.eq.${user.id}`)
    .eq("status", "scheduled")
    .order("created_at", { ascending: true })
    .limit(1);

  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: myPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch pending help offers on user's posts
  const myPostIds = (myPosts ?? []).map((p) => p.id);
  let pendingOffers: Array<{
    id: string;
    post_id: string;
    giver_id: string;
    message: string | null;
    created_at: string;
    profiles: { first_name: string; last_name: string; rating_avg: number };
    posts: { title: string };
  }> = [];

  if (myPostIds.length > 0) {
    const { data } = await supabase
      .from("connection_requests")
      .select("*, profiles!connection_requests_giver_id_fkey(first_name, last_name, rating_avg), posts(title)")
      .in("post_id", myPostIds)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5);
    pendingOffers = (data ?? []) as typeof pendingOffers;
  }

  const nextSession = upcomingSessions?.[0];
  const displayName = profile?.first_name || "there";

  return (
    <>
      <TopBar
        title={`Welcome, ${displayName}`}
        subtitle="Dashboard"
      />

      <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto w-full">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Credits Card */}
          <Link href="/credits">
            <Card className="!bg-primary text-white !border-none relative overflow-hidden hover:opacity-90 transition-opacity cursor-pointer">
              <Coins className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold">
                {profile?.credits_balance ?? 0}
              </p>
              <p className="text-sm opacity-70 mt-1">Credits available</p>
            </Card>
          </Link>

          {/* Next Session Card */}
          <Card className="md:col-span-2">
            {nextSession ? (
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold uppercase rounded-full mb-2">
                    Upcoming Next
                  </span>
                  <h3 className="text-lg font-bold text-primary">
                    {(nextSession as Record<string, unknown> & { posts?: { title?: string } }).posts?.title ?? "Session"}
                  </h3>
                </div>
                <Calendar className="w-5 h-5 text-text-secondary" />
              </div>
            ) : (
              <div className="flex items-center gap-3 text-text-secondary">
                <Calendar className="w-5 h-5" />
                <p className="text-sm">No upcoming sessions</p>
              </div>
            )}
          </Card>
        </div>

        {/* Pending Help Offers */}
        {pendingOffers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <HandHelping className="w-4 h-4 text-secondary" />
              Pending Help Offers
            </h3>
            <div className="space-y-2">
              {pendingOffers.map((offer) => (
                <Link key={offer.id} href={`/posts/${offer.post_id}`}>
                  <Card className="flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-secondary">
                          {offer.profiles.first_name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {[offer.profiles.first_name, offer.profiles.last_name].filter(Boolean).join(" ")} wants to help
                        </p>
                        <p className="text-xs text-text-secondary">
                          on &ldquo;{offer.posts.title}&rdquo;
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {Number(offer.profiles.rating_avg) > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-star fill-star" />
                          <span className="text-[10px] text-text-secondary">
                            {Number(offer.profiles.rating_avg).toFixed(1)}
                          </span>
                        </div>
                      )}
                      <span className="text-xs font-bold text-secondary">
                        Review
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/posts/create">
            <Card className="hover:shadow-md transition-shadow cursor-pointer flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-md">
                <PlusCircle className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-primary">
                  Create a Post
                </p>
                <p className="text-xs text-text-secondary">
                  Get help with a repair
                </p>
              </div>
            </Card>
          </Link>
          <Link href="/browse">
            <Card className="hover:shadow-md transition-shadow cursor-pointer flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-md">
                <Compass className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-primary">
                  Browse Problems
                </p>
                <p className="text-xs text-text-secondary">
                  Help someone out
                </p>
              </div>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* My Open Posts */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
              My Open Posts
            </h3>
            <MyPostsList posts={myPosts ?? []} />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
              Recent Activity
            </h3>
            <Card>
              {recentTransactions && recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-start gap-3">
                      <div
                        className={`mt-1 p-1 rounded ${
                          tx.amount > 0
                            ? "bg-secondary/10"
                            : "bg-accent/10"
                        }`}
                      >
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="w-3 h-3 text-secondary" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-accent" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount} Credits
                        </p>
                        <p className="text-xs text-text-secondary">
                          {tx.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary text-center py-4">
                  No recent activity yet
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
