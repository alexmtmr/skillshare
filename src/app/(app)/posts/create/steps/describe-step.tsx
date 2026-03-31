"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DescribeStepProps {
  title: string;
  onTitleChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
}

export function DescribeStep({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
}: DescribeStepProps) {
  const t = useTranslations("posts");

  return (
    <Card>
      <h2 className="text-xl font-semibold text-primary mb-4">
        Describe your problem
      </h2>
      <div className="space-y-4">
        <div>
          <Input
            label={t("titleLabel")}
            value={title}
            onChange={(e) => onTitleChange(e.target.value.slice(0, 80))}
            placeholder={t("titlePlaceholder")}
            required
          />
          <p className="text-xs text-text-secondary mt-1 text-right">
            {title.length}/80
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            {t("descriptionLabel")}
          </label>
          <textarea
            value={description}
            onChange={(e) =>
              onDescriptionChange(e.target.value.slice(0, 500))
            }
            placeholder={t("descriptionPlaceholder")}
            rows={5}
            className="w-full px-4 py-3 border border-divider rounded-DEFAULT text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors resize-none"
          />
          <p className="text-xs text-text-secondary mt-1 text-right">
            {description.length}/500
          </p>
        </div>
      </div>
    </Card>
  );
}
