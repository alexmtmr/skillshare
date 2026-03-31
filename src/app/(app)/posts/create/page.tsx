"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/app/(auth)/register/step-indicator";
import { CategoryStep } from "./steps/category-step";
import { DescribeStep } from "./steps/describe-step";
import { ImagesStep } from "./steps/images-step";
import { UrgencyStep } from "./steps/urgency-step";
import { AvailabilityStep } from "./steps/availability-step";
import { ReviewStep } from "./steps/review-step";
import type { PostCategory, Urgency } from "@/lib/types";

export interface TimeSlotInput {
  date: string;
  start_time: string;
  end_time: string;
}

const TOTAL_STEPS = 6;

export default function CreatePostPage() {
  const t = useTranslations("posts");
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [category, setCategory] = useState<PostCategory | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<Urgency>("low");
  const [timeSlots, setTimeSlots] = useState<TimeSlotInput[]>([]);

  function canProceed() {
    switch (step) {
      case 1: return category !== "";
      case 2: return title.trim().length > 0 && description.trim().length > 0;
      case 3: return true; // images optional
      case 4: return true; // urgency has default
      case 5: return timeSlots.length > 0;
      case 6: return true;
      default: return false;
    }
  }

  async function handlePublish() {
    setError("");
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    // Check credit balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", user.id)
      .single();

    if (!profile || profile.credits_balance < 1) {
      setError("Not enough credits. You need 1 credit to post a problem.");
      setLoading(false);
      return;
    }

    // Create the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        title,
        description,
        category,
        urgency,
        images: imageUrls,
        status: "open",
      })
      .select()
      .single();

    if (postError || !post) {
      setError(postError?.message || "Failed to create post.");
      setLoading(false);
      return;
    }

    // Insert time slots
    if (timeSlots.length > 0) {
      const { error: slotError } = await supabase.from("time_slots").insert(
        timeSlots.map((slot) => ({
          post_id: post.id,
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          status: "available",
        }))
      );

      if (slotError) {
        setError(slotError.message);
        setLoading(false);
        return;
      }
    }

    // Deduct 1 credit
    await supabase
      .from("profiles")
      .update({ credits_balance: profile.credits_balance - 1 })
      .eq("id", user.id);

    // Log transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "spend",
      amount: -1,
      description: `Posted: ${title}`,
    });

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <TopBar title={t("createTitle")} />
      <div className="p-6 md:p-10 max-w-xl mx-auto w-full space-y-6">
        <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

        {step === 1 && (
          <CategoryStep value={category} onChange={setCategory} />
        )}
        {step === 2 && (
          <DescribeStep
            title={title}
            onTitleChange={setTitle}
            description={description}
            onDescriptionChange={setDescription}
          />
        )}
        {step === 3 && (
          <ImagesStep images={imageUrls} onChange={setImageUrls} />
        )}
        {step === 4 && (
          <UrgencyStep value={urgency} onChange={setUrgency} />
        )}
        {step === 5 && (
          <AvailabilityStep slots={timeSlots} onChange={setTimeSlots} />
        )}
        {step === 6 && (
          <ReviewStep
            category={category as PostCategory}
            title={title}
            description={description}
            images={imageUrls}
            urgency={urgency}
            timeSlots={timeSlots}
          />
        )}

        {error && (
          <p className="text-sm text-accent text-center">{error}</p>
        )}

        <div className="flex gap-3">
          {step > 1 && (
            <Button
              variant="secondary"
              onClick={() => { setError(""); setStep(step - 1); }}
              className="flex-1"
            >
              Back
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              loading={loading}
              className="flex-1"
            >
              {t("publishPost")}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
