"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Clock, AlertTriangle, AlertCircle } from "lucide-react";
import type { Urgency } from "@/lib/types";

interface UrgencyStepProps {
  value: Urgency;
  onChange: (u: Urgency) => void;
}

const urgencyOptions: {
  value: Urgency;
  icon: typeof Clock;
  color: string;
  selectedBg: string;
}[] = [
  {
    value: "low",
    icon: Clock,
    color: "text-secondary",
    selectedBg: "border-secondary bg-secondary/5",
  },
  {
    value: "medium",
    icon: AlertTriangle,
    color: "text-star",
    selectedBg: "border-star bg-star/5",
  },
  {
    value: "high",
    icon: AlertCircle,
    color: "text-accent",
    selectedBg: "border-accent bg-accent/5",
  },
];

export function UrgencyStep({ value, onChange }: UrgencyStepProps) {
  const t = useTranslations("posts");

  return (
    <Card>
      <h2 className="text-xl font-semibold text-primary mb-4">
        {t("urgencyLabel")}
      </h2>
      <div className="space-y-3">
        {urgencyOptions.map(({ value: urgVal, icon: Icon, color, selectedBg }) => {
          const isSelected = value === urgVal;
          const labelKey = `urgency${urgVal.charAt(0).toUpperCase() + urgVal.slice(1)}` as
            | "urgencyLow"
            | "urgencyMedium"
            | "urgencyHigh";
          const descKey = `${labelKey}Desc` as
            | "urgencyLowDesc"
            | "urgencyMediumDesc"
            | "urgencyHighDesc";

          return (
            <button
              key={urgVal}
              type="button"
              onClick={() => onChange(urgVal)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-4 ${
                isSelected ? selectedBg : "border-divider hover:border-text-secondary"
              }`}
            >
              <Icon className={`w-6 h-6 ${color}`} />
              <div>
                <p className="font-semibold text-text-primary">
                  {t(labelKey)}
                </p>
                <p className="text-sm text-text-secondary">{t(descKey)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
