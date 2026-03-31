"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  HandHelping,
  Hourglass,
} from "lucide-react";
import type { Post, TimeSlot, ConnectionRequest } from "@/lib/types";

interface PostWithProfile extends Post {
  profiles: {
    first_name: string;
    last_name: string;
    rating_avg: number;
    avatar_url: string | null;
    created_at: string;
  };
}

interface PendingRequest {
  id: string;
  giver_id: string;
  timeslot_id: string;
  message: string | null;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    rating_avg: number;
    avatar_url: string | null;
    skills: string[];
  };
  time_slots: { date: string; start_time: string; end_time: string };
}

interface PostDetailClientProps {
  post: PostWithProfile;
  timeSlots: TimeSlot[];
  userId: string;
  isOwner: boolean;
  existingRequest: ConnectionRequest | null;
  pendingRequests: PendingRequest[];
}

const urgencyColors: Record<string, string> = {
  low: "bg-secondary/10 text-secondary",
  medium: "bg-star/10 text-star",
  high: "bg-accent/10 text-accent",
};

export function PostDetailClient({
  post,
  timeSlots,
  userId,
  isOwner,
  existingRequest,
  pendingRequests,
}: PostDetailClientProps) {
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);

  const seekerName = [post.profiles?.first_name, post.profiles?.last_name].filter(Boolean).join(" ") || "Anonymous";
  const seekerRating = Number(post.profiles?.rating_avg || 0);
  const memberSince = post.profiles?.created_at
    ? new Date(post.profiles.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  async function handleOfferHelp() {
    if (!selectedSlot) return;
    setError("");
    setLoading(true);

    const supabase = createClient();

    // Create connection request (NOT a session)
    const { error: reqError } = await supabase
      .from("connection_requests")
      .insert({
        post_id: post.id,
        giver_id: userId,
        timeslot_id: selectedSlot,
        message: message.trim() || null,
        status: "pending",
      });

    if (reqError) {
      setError(
        reqError.code === "23505"
          ? "You already offered help on this post."
          : reqError.message
      );
      setLoading(false);
      return;
    }

    // Notify the seeker
    await supabase.from("notifications").insert({
      user_id: post.user_id,
      type: "connection_request",
      title: "Someone wants to help!",
      message: `A helper has offered to help with "${post.title}"`,
      data: { post_id: post.id },
    });

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  async function handleAcceptRequest(request: PendingRequest) {
    setAcceptingId(request.id);
    setError("");
    const supabase = createClient();

    // Accept the request
    const { error: updateErr } = await supabase
      .from("connection_requests")
      .update({ status: "accepted" })
      .eq("id", request.id);

    if (updateErr) {
      setError(updateErr.message);
      setAcceptingId(null);
      return;
    }

    // Create the session
    const { data: session, error: sessionErr } = await supabase
      .from("sessions")
      .insert({
        post_id: post.id,
        seeker_id: post.user_id,
        giver_id: request.giver_id,
        timeslot_id: request.timeslot_id,
        status: "scheduled",
        max_duration: 30,
      })
      .select()
      .single();

    if (sessionErr) {
      setError(sessionErr.message);
      setAcceptingId(null);
      return;
    }

    // Book the time slot
    await supabase
      .from("time_slots")
      .update({ status: "booked" })
      .eq("id", request.timeslot_id);

    // Mark post as matched
    await supabase
      .from("posts")
      .update({ status: "matched" })
      .eq("id", post.id);

    // Decline all other pending requests for this post
    await supabase
      .from("connection_requests")
      .update({ status: "declined" })
      .eq("post_id", post.id)
      .neq("id", request.id)
      .eq("status", "pending");

    // Notify the accepted giver
    await supabase.from("notifications").insert({
      user_id: request.giver_id,
      type: "request_accepted",
      title: "Your offer was accepted!",
      message: `The seeker accepted your help offer for "${post.title}"`,
      data: { post_id: post.id, session_id: session.id },
    });

    // Notify declined givers
    const declinedRequests = pendingRequests.filter(
      (r) => r.id !== request.id
    );
    for (const declined of declinedRequests) {
      await supabase.from("notifications").insert({
        user_id: declined.giver_id,
        type: "request_declined",
        title: "Help offer not needed",
        message: `The seeker chose another helper for "${post.title}"`,
        data: { post_id: post.id },
      });
    }

    setAcceptingId(null);
    router.refresh();
  }

  async function handleDeclineRequest(requestId: string, giverId: string) {
    setDecliningId(requestId);
    const supabase = createClient();

    await supabase
      .from("connection_requests")
      .update({ status: "declined" })
      .eq("id", requestId);

    // Notify the giver
    await supabase.from("notifications").insert({
      user_id: giverId,
      type: "request_declined",
      title: "Help offer declined",
      message: `The seeker declined your offer for "${post.title}"`,
      data: { post_id: post.id },
    });

    setDecliningId(null);
    router.refresh();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto w-full space-y-6">
      {/* Image Carousel */}
      {post.images && post.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {post.images.map((url, i) => (
            <div
              key={url}
              className="shrink-0 w-72 h-48 rounded-lg overflow-hidden border border-divider"
            >
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Category + Urgency */}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded capitalize">
          {post.category}
        </span>
        <span
          className={`px-3 py-1 text-xs font-bold rounded capitalize ${urgencyColors[post.urgency]}`}
        >
          {post.urgency}
        </span>
      </div>

      {/* Title + Description */}
      <div>
        <h1 className="text-2xl font-bold text-primary">{post.title}</h1>
        <p className="text-text-secondary mt-3 whitespace-pre-wrap">
          {post.description}
        </p>
      </div>

      {/* Seeker Profile (clickable link to public profile) */}
      <Link href={`/profile/${post.user_id}`}>
        <Card className="flex items-center gap-4 hover:border-secondary/30 transition-colors">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-primary">
              {seekerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-bold text-primary">{seekerName}</p>
            <div className="flex items-center gap-3 mt-0.5">
              {seekerRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-star fill-star" />
                  <span className="text-xs text-text-secondary">
                    {seekerRating.toFixed(1)}
                  </span>
                </div>
              )}
              {memberSince && (
                <span className="text-xs text-text-secondary">
                  Member since {memberSince}
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>

      {/* === GIVER VIEW: Offer Help === */}
      {!isOwner && !existingRequest && post.status === "open" && (
        <>
          {/* Time Slots */}
          {timeSlots.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Available Times
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                      selectedSlot === slot.id
                        ? "border-secondary bg-secondary/5"
                        : "border-divider hover:border-text-secondary"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {formatDate(slot.date)}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-text-secondary" />
                        <span className="text-xs text-text-secondary">
                          {slot.start_time} – {slot.end_time}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 ${
                        selectedSlot === slot.id
                          ? "border-secondary bg-secondary"
                          : "border-divider"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional message */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Message to seeker (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 300))}
              placeholder="Introduce yourself or share how you can help..."
              rows={3}
              className="w-full px-4 py-3 border border-divider rounded-DEFAULT text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
            />
            <p className="text-xs text-text-secondary mt-1 text-right">
              {message.length}/300
            </p>
          </div>

          {error && <p className="text-sm text-accent text-center">{error}</p>}

          <Button
            onClick={handleOfferHelp}
            disabled={!selectedSlot}
            loading={loading}
            className="w-full"
          >
            <HandHelping className="w-5 h-5" />
            Offer Help
          </Button>
        </>
      )}

      {/* Giver already sent a request */}
      {!isOwner && existingRequest && (
        <Card className="text-center py-6">
          {existingRequest.status === "pending" && (
            <>
              <Hourglass className="w-8 h-8 text-star mx-auto mb-2" />
              <p className="text-sm font-semibold text-primary">
                Offer sent!
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Waiting for the seeker to accept your help offer.
              </p>
            </>
          )}
          {existingRequest.status === "accepted" && (
            <>
              <CheckCircle className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-semibold text-primary">
                Offer accepted!
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Check your sessions page for the scheduled session.
              </p>
            </>
          )}
          {existingRequest.status === "declined" && (
            <>
              <XCircle className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm font-semibold text-primary">
                Offer declined
              </p>
              <p className="text-xs text-text-secondary mt-1">
                The seeker chose a different helper.
              </p>
            </>
          )}
        </Card>
      )}

      {/* Post already matched/completed */}
      {!isOwner && !existingRequest && post.status !== "open" && (
        <Card className="text-center py-4">
          <p className="text-sm text-text-secondary">
            This post is no longer accepting offers.
          </p>
        </Card>
      )}

      {/* === OWNER VIEW: See pending requests === */}
      {isOwner && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <HandHelping className="w-4 h-4" />
            Help Offers ({pendingRequests.length})
          </h3>

          {pendingRequests.length === 0 ? (
            <Card className="text-center py-6">
              <Hourglass className="w-8 h-8 text-divider mx-auto mb-2" />
              <p className="text-sm text-text-secondary">
                No help offers yet. Hang tight — helpers will find your post!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="space-y-3">
                  {/* Giver info */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/profile/${request.giver_id}`}
                      className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-secondary">
                          {request.profiles.first_name?.charAt(0)?.toUpperCase() ||
                            "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {[request.profiles.first_name, request.profiles.last_name].filter(Boolean).join(" ")}
                        </p>
                        <div className="flex items-center gap-2">
                          {Number(request.profiles.rating_avg) > 0 && (
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-star fill-star" />
                              <span className="text-[10px] text-text-secondary">
                                {Number(request.profiles.rating_avg).toFixed(1)}
                              </span>
                            </div>
                          )}
                          {request.profiles.skills?.length > 0 && (
                            <span className="text-[10px] text-text-secondary">
                              {request.profiles.skills
                                .map(
                                  (s: string) =>
                                    s.charAt(0).toUpperCase() + s.slice(1)
                                )
                                .join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Message */}
                  {request.message && (
                    <p className="text-sm text-text-secondary bg-background p-3 rounded-lg">
                      &ldquo;{request.message}&rdquo;
                    </p>
                  )}

                  {/* Proposed time */}
                  <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDate(request.time_slots.date)},{" "}
                      {request.time_slots.start_time} –{" "}
                      {request.time_slots.end_time}
                    </span>
                  </div>

                  {/* Accept / Decline buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handleDeclineRequest(request.id, request.giver_id)
                      }
                      loading={decliningId === request.id}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline
                    </Button>
                    <Button
                      onClick={() => handleAcceptRequest(request)}
                      loading={acceptingId === request.id}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-accent text-center">{error}</p>}
        </div>
      )}
    </div>
  );
}
