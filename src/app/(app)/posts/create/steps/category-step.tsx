"use client";

import { useTranslations } from "next-intl";
import { Droplets, Zap, Refrigerator, Flame, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { PostCategory } from "@/lib/types";

interface CategoryStepProps {
  value: PostCategory | "";
  onChange: (cat: PostCategory) => void;
}

const categories: { value: PostCategory; icon: typeof Wrench }[] = [
  { value: "plumbing", icon: Droplets },
  { value: "electrical", icon: Zap },
  { value: "appliances", icon: Refrigerator },
  { value: "heating", icon: Flame },
  { value: "general", icon: Wrench },
];

export function CategoryStep({ value, onChange }: CategoryStepProps) {
  const t = useTranslations("categories");

  return (
    <Card>
      <h2 className="text-xl font-semibold text-primary mb-4">
        What type of problem?
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {categories.map(({ value: catValue, icon: Icon }) => {
          const isSelected = value === catValue;
          return (
            <button
              key={catValue}
              type="button"
              onClick={() => onChange(catValue)}
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
    </Card>
  );
}
