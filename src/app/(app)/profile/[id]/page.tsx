import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { Star, Calendar, Award, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PublicProfilePage({
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

  // If viewing own profile, redirect to editable profile page
  if (user.id === id) redirect("/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) {
    return (
      <>
        <TopBar title="Profile" />
        <div className="p-6 md:p-10 max-w-2xl mx-auto w-full">
          <Card className="text-center py-12">
            <p className="text-text-secondary">User not found</p>
            <Link
              href="/browse"
              className="text-secondary text-sm font-medium hover:underline mt-2 inline-block"
            >
              Back to Browse
            </Link>
          </Card>
        </div>
      </>
    );
  }

  // Get ratings for this user
  const { data: ratings } = await supabase
    .from("ratings")
    .select("*, profiles!ratings_rater_id_fkey(first_name, last_name)")
    .eq("rated_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Count completed sessions as giver
  const { count: sessionsHelped } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("giver_id", id)
    .eq("status", "completed");

  const memberSince = new Date(profile.created_at).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  return (
    <>
      <TopBar title="Profile" />
      <div className="p-6 md:p-10 max-w-2xl mx-auto w-full space-y-6">
        {/* Back link */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Profile Card */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={[profile.first_name, profile.last_name].filter(Boolean).join(" ")}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-primary">
                  {profile.first_name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">
                {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Anonymous"}
              </h2>
              {profile.bio && (
                <p className="text-sm text-text-secondary mt-0.5">
                  {profile.bio}
                </p>
              )}
              <p className="text-xs text-text-secondary mt-1 capitalize">
                Role: {profile.role}
              </p>
            </div>
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-4 pt-4 border-t border-divider">
              <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">
                Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-secondary/10 text-secondary text-sm font-medium rounded-full capitalize"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <Star className="w-5 h-5 text-star mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">
              {Number(profile.rating_avg).toFixed(1)}
            </p>
            <p className="text-[10px] text-text-secondary uppercase font-bold">
              Rating
            </p>
          </Card>
          <Card className="text-center">
            <Award className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">
              {sessionsHelped ?? 0}
            </p>
            <p className="text-[10px] text-text-secondary uppercase font-bold">
              People Helped
            </p>
          </Card>
          <Card className="text-center">
            <Calendar className="w-5 h-5 text-text-secondary mx-auto mb-1" />
            <p className="text-sm font-bold text-primary">{memberSince}</p>
            <p className="text-[10px] text-text-secondary uppercase font-bold">
              Member since
            </p>
          </Card>
        </div>

        {/* Reviews */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
            Reviews
          </h3>
          {ratings && ratings.length > 0 ? (
            <div className="space-y-2">
              {ratings.map((rating) => (
                <Card key={rating.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating.stars
                                ? "text-star fill-star"
                                : "text-divider"
                            }`}
                          />
                        ))}
                      </div>
                      {rating.comment && (
                        <p className="text-sm text-text-primary">
                          {rating.comment}
                        </p>
                      )}
                      <p className="text-xs text-text-secondary mt-1">
                        by{" "}
                        {(() => {
                          const p = rating.profiles as { first_name: string; last_name: string } | null;
                          return p ? [p.first_name, p.last_name].filter(Boolean).join(" ") || "Anonymous" : "Anonymous";
                        })()}{" "}
                        ·{" "}
                        {new Date(rating.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-sm text-text-secondary text-center py-4">
                No reviews yet
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
