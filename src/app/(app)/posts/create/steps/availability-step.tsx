"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import type { TimeSlotInput } from "../page";

interface AvailabilityStepProps {
  slots: TimeSlotInput[];
  onChange: (slots: TimeSlotInput[]) => void;
}

export function AvailabilityStep({ slots, onChange }: AvailabilityStepProps) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");

  // Default min date is today
  const today = new Date().toISOString().split("T")[0];

  function addSlot() {
    if (!date || !startTime || !endTime) return;
    if (startTime >= endTime) return;

    onChange([
      ...slots,
      { date, start_time: startTime, end_time: endTime },
    ]);
    // Reset time but keep date for easy multi-slot same-day entry
    setStartTime("09:00");
    setEndTime("12:00");
  }

  function removeSlot(index: number) {
    onChange(slots.filter((_, i) => i !== index));
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-primary mb-2">
        When are you available?
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        Add time windows when you can do the repair
      </p>

      {/* Add slot form */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-12 px-4 border border-divider rounded-DEFAULT text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              From
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-12 px-4 border border-divider rounded-DEFAULT text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              To
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full h-12 px-4 border border-divider rounded-DEFAULT text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={addSlot}
          disabled={!date || startTime >= endTime}
          className="w-full"
        >
          <Plus className="w-4 h-4" />
          Add Time Slot
        </Button>
      </div>

      {/* Listed slots */}
      {slots.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">
            Your available times ({slots.length})
          </p>
          {slots.map((slot, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-background rounded-lg"
            >
              <div>
                <p className="text-sm font-semibold text-primary">
                  {formatDate(slot.date)}
                </p>
                <p className="text-xs text-text-secondary">
                  {slot.start_time} – {slot.end_time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeSlot(i)}
                className="p-1 text-text-secondary hover:text-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
