"use client";

import { useTranslations } from "next-intl";
import {
  Droplets,
  Zap,
  Refrigerator,
  Flame,
  Wrench,
} from "lucide-react";
import type { PostCategory } from "@/lib/types";

interface SkillSelectionProps {
  value: PostCategory[];
  onChange: (skills: PostCategory[]) => void;
}

const categories: { value: PostCategory; icon: typeof Wrench }[] = [
  { value: "plumbing", icon: Droplets },
  { value: "electrical", icon: Zap },
  { value: "appliances", icon: Refrigerator },
  { value: "heating", icon: Flame },
  { value: "general", icon: Wrench },
];

export function SkillSelection({ value, onChange }: SkillSelectionProps) {
  const t = useTranslations("categories");

  function toggleSkill(skill: PostCategory) {
    if (value.includes(skill)) {
      onChange(value.filter((s) => s !== skill));
    } else {
      onChange([...value, skill]);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-text-secondary">
        Select the areas you can help with
      </p>
      <div className="grid grid-cols-2 gap-3">
        {categories.map(({ value: catValue, icon: Icon }) => {
          const isSelected = value.includes(catValue);

          return (
            <button
              key={catValue}
              type="button"
              onClick={() => toggleSkill(catValue)}
              className={`p-4 rounded-lg border-2 text-center transition-all flex flex-col items-center gap-2 ${
                isSelected
                  ? "border-secondary bg-secondary/5"
                  : "border-divider hover:border-text-secondary"
              }`}
            >
              <Icon
                className={`w-6 h-6 ${
                  isSelected ? "text-secondary" : "text-text-secondary"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isSelected ? "text-secondary" : "text-text-primary"
                }`}
              >
                {t(catValue)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
