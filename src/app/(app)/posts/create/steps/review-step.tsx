"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import type { PostCategory, Urgency } from "@/lib/types";
import type { TimeSlotInput } from "../page";

interface ReviewStepProps {
  category: PostCategory;
  title: string;
  description: string;
  images: string[];
  urgency: Urgency;
  timeSlots: TimeSlotInput[];
}

export function ReviewStep({
  category,
  title,
  description,
  images,
  urgency,
  timeSlots,
}: ReviewStepProps) {
  const t = useTranslations();

  const urgencyColors: Record<Urgency, string> = {
    low: "bg-secondary/10 text-secondary",
    medium: "bg-star/10 text-star",
    high: "bg-accent/10 text-accent",
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-primary mb-4">
        {t("posts.reviewTitle")}
      </h2>

      <div className="space-y-4">
        {/* Category & Urgency */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded capitalize">
            {t(`categories.${category}`)}
          </span>
          <span
            className={`px-2.5 py-0.5 text-xs font-bold rounded capitalize ${urgencyColors[urgency]}`}
          >
            {urgency}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">
            {description}
          </p>
        </div>

        {/* Images */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <div
                key={url}
                className="aspect-square rounded-md overflow-hidden border border-divider"
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

        {/* Time Slots */}
        {timeSlots.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">
              Available Times
            </p>
            <div className="space-y-1">
              {timeSlots.map((slot, i) => (
                <p key={i} className="text-sm text-text-primary">
                  {new Date(slot.date + "T00:00:00").toLocaleDateString(
                    "en-US",
                    { weekday: "short", month: "short", day: "numeric" }
                  )}{" "}
                  · {slot.start_time} – {slot.end_time}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Cost */}
        <div className="pt-3 border-t border-divider">
          <p className="text-sm font-semibold text-primary">
            {t("posts.postCost")}
          </p>
        </div>
      </div>
    </Card>
  );
}
