"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageSquare,
  Star,
} from "lucide-react";

interface SessionClientProps {
  session: {
    id: string;
    post_id: string;
    seeker_id: string;
    giver_id: string;
    timeslot_id: string;
    status: string;
    max_duration: number;
    started_at: string | null;
    ended_at: string | null;
    posts: { title: string; category: string; description: string } | null;
  };
  otherName: string;
  isSeeker: boolean;
  userId: string;
  hasRated: boolean;
}

export function SessionClient({
  session,
  otherName,
  isSeeker,
  userId,
  hasRated,
}: SessionClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(session.status);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  // Session timer
  useEffect(() => {
    if (status === "in_progress") {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeWarning = minutes >= 25;
  const timeUp = minutes >= 30;

  function formatTime(m: number, s: number) {
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  async function handleCancelSession() {
    if (!confirm("Cancel this session? The post will be reopened.")) return;
    setLoading(true);
    const supabase = createClient();

    // Cancel the session
    await supabase
      .from("sessions")
      .update({ status: "cancelled", ended_at: new Date().toISOString() })
      .eq("id", session.id);

    // Free up the time slot
    if (session.timeslot_id) {
      await supabase
        .from("time_slots")
        .update({ status: "available" })
        .eq("id", session.timeslot_id);
    }

    // Reopen the post
    await supabase
      .from("posts")
      .update({ status: "open" })
      .eq("id", session.post_id);

    // Notify the other party
    const otherUserId = isSeeker ? session.giver_id : session.seeker_id;
    await supabase.from("notifications").insert({
      user_id: otherUserId,
      type: "session_cancelled",
      title: "Session cancelled",
      message: `The session for "${session.posts?.title ?? "a post"}" was cancelled.`,
      data: { post_id: session.post_id },
    });

    setLoading(false);
    router.push("/sessions");
    router.refresh();
  }

  async function handleStartSession() {
    setLoading(true);
    const supabase = createClient();

    await supabase
      .from("sessions")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", session.id);

    setStatus("in_progress");
    setLoading(false);
  }

  async function handleEndSession() {
    if (status === "completed") return; // Prevent double-end
    setLoading(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const supabase = createClient();

    // Only complete if still in_progress (atomic check)
    const { data: updated } = await supabase
      .from("sessions")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", session.id)
      .eq("status", "in_progress") // Only update if still in_progress
      .select()
      .single();

    // If no row was updated, session was already completed
    if (!updated) {
      setStatus("completed");
      setLoading(false);
      if (isSeeker) setShowRating(true);
      return;
    }

    // Award 2 credits to the giver
    const giverId = session.giver_id;
    const { data: giverProfile } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", giverId)
      .single();

    if (giverProfile) {
      await supabase
        .from("profiles")
        .update({ credits_balance: giverProfile.credits_balance + 2 })
        .eq("id", giverId);

      await supabase.from("transactions").insert({
        user_id: giverId,
        type: "earn",
        amount: 2,
        description: `Completed session: ${session.posts?.title ?? "Help session"}`,
      });
    }

    // Update post status to completed
    await supabase
      .from("posts")
      .update({ status: "completed" })
      .eq("id", session.post_id);

    // Notify both parties
    await supabase.from("notifications").insert({
      user_id: giverId,
      type: "credits_earned",
      title: "Credits earned!",
      message: "You earned 2 credits for completing a help session.",
      data: { session_id: session.id },
    });

    setStatus("completed");
    setLoading(false);
    setShowRating(true);
  }

  async function handleSubmitRating() {
    if (rating === 0) return;
    setLoading(true);

    const supabase = createClient();
    const ratedUserId = isSeeker ? session.giver_id : session.seeker_id;

    await supabase.from("ratings").insert({
      session_id: session.id,
      rater_id: userId,
      rated_id: ratedUserId,
      stars: rating,
      comment: comment || null,
    });

    await supabase.from("notifications").insert({
      user_id: ratedUserId,
      type: "rating_received",
      title: "New review!",
      message: `You received a ${rating}-star review.`,
      data: { session_id: session.id },
    });

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  // Rating Screen — both seeker and giver can rate
  if (showRating || (status === "completed" && !hasRated)) {
    return (
      <div className="p-6 md:p-10 max-w-md mx-auto w-full space-y-6">
        <Card className="text-center space-y-6">
          <h2 className="text-xl font-semibold text-primary">
            Rate this session
          </h2>
          <p className="text-sm text-text-secondary">
            How was your experience with {otherName}?
          </p>

          {/* Star rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= rating
                      ? "text-star fill-star"
                      : "text-divider"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave optional feedback..."
            rows={3}
            className="w-full px-4 py-3 border border-divider rounded-DEFAULT text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
          />

          <Button
            onClick={handleSubmitRating}
            disabled={rating === 0}
            loading={loading}
            className="w-full"
          >
            Submit Rating
          </Button>
        </Card>
      </div>
    );
  }

  // Completed state (giver view or already rated)
  if (status === "completed") {
    return (
      <div className="p-6 md:p-10 max-w-md mx-auto w-full">
        <Card className="text-center space-y-4">
          <div className="p-3 bg-secondary/10 rounded-full w-fit mx-auto">
            <Phone className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-xl font-semibold text-primary">
            Session Complete
          </h2>
          <p className="text-sm text-text-secondary">
            {isSeeker
              ? "Thank you for your rating!"
              : "Great job! You earned 2 credits."}
          </p>
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Pre-call / Active call
  return (
    <div className="flex-1 flex flex-col">
      {/* Video placeholder */}
      <div className="flex-1 bg-primary relative flex items-center justify-center min-h-[400px]">
        {status === "scheduled" ? (
          <div className="text-center space-y-4">
            <Video className="w-16 h-16 text-white/30 mx-auto" />
            <div>
              <h3 className="text-white text-lg font-bold">
                {session.posts?.title}
              </h3>
              <p className="text-white/60 text-sm mt-1">
                Session with {otherName}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <Button onClick={handleStartSession} loading={loading}>
                Start Session
              </Button>
              <button
                onClick={handleCancelSession}
                disabled={loading}
                className="text-sm text-text-secondary hover:text-accent transition-colors disabled:opacity-50"
              >
                Cancel Session
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <Video className="w-16 h-16 text-white/20 mx-auto" />
            <p className="text-white/50 text-sm">
              Video calls coming in V2
            </p>
          </div>
        )}

        {/* Timer */}
        {status === "in_progress" && (
          <div
            className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${
              timeWarning
                ? "bg-accent text-white"
                : "bg-white/10 text-white"
            }`}
          >
            {formatTime(minutes, seconds)}
            {timeWarning && !timeUp && " · 5 min left"}
            {timeUp && " · Time's up!"}
          </div>
        )}

        {/* Other person name */}
        {status === "in_progress" && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/10 rounded-lg">
            <p className="text-white text-sm font-semibold">{otherName}</p>
          </div>
        )}

        {/* Self-view placeholder */}
        {status === "in_progress" && (
          <div className="absolute bottom-4 right-4 w-28 h-20 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
            {cameraOff ? (
              <VideoOff className="w-5 h-5 text-white/40" />
            ) : (
              <p className="text-white/40 text-xs">You</p>
            )}
          </div>
        )}
      </div>

      {/* Control bar */}
      {status === "in_progress" && (
        <div className="bg-surface border-t border-divider px-6 py-4 flex items-center justify-center gap-4">
          <button
            onClick={() => setMuted(!muted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              muted ? "bg-accent/10 text-accent" : "bg-background text-text-secondary"
            }`}
          >
            {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setCameraOff(!cameraOff)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              cameraOff ? "bg-accent/10 text-accent" : "bg-background text-text-secondary"
            }`}
          >
            {cameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndSession}
            className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          >
            <Phone className="w-6 h-6 rotate-[135deg]" />
          </button>

          <button className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-text-secondary">
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
