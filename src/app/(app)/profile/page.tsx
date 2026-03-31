import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { Star, Calendar, Coins, Mail } from "lucide-react";
import { ProfileEditor } from "./profile-editor";

export default async function ProfilePage() {
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

  if (!profile) redirect("/login");

  const { data: ratings } = await supabase
    .from("ratings")
    .select("*, profiles!ratings_rater_id_fkey(first_name, last_name)")
    .eq("rated_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const memberSince = new Date(profile.created_at).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  return (
    <>
      <TopBar title="Profile" />
      <div className="p-6 md:p-10 max-w-2xl mx-auto w-full space-y-6">
        {/* Editable Profile */}
        <ProfileEditor profile={profile} />

        {/* Account Email */}
        <Card className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <Mail className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-[10px] text-text-secondary uppercase font-bold">
              Signed in as
            </p>
            <p className="text-sm font-medium text-primary">
              {profile.email}
            </p>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <Coins className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">
              {profile.credits_balance}
            </p>
            <p className="text-[10px] text-text-secondary uppercase font-bold">
              Credits
            </p>
          </Card>
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
                        by {(() => { const p = rating.profiles as { first_name: string; last_name: string } | null; return p ? [p.first_name, p.last_name].filter(Boolean).join(" ") || "Anonymous" : "Anonymous"; })()} ·{" "}
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
