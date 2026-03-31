"use client";

import { useTranslations } from "next-intl";
import { HelpCircle, Wrench, ArrowLeftRight } from "lucide-react";
import type { UserRole } from "@/lib/types";

interface RoleSelectionProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

const roles: { value: UserRole; icon: typeof HelpCircle; key: string; descKey: string }[] = [
  { value: "seeker", icon: HelpCircle, key: "roleSeeker", descKey: "roleSeekerDesc" },
  { value: "giver", icon: Wrench, key: "roleGiver", descKey: "roleGiverDesc" },
  { value: "both", icon: ArrowLeftRight, key: "roleBoth", descKey: "roleBothDesc" },
];

export function RoleSelection({ value, onChange }: RoleSelectionProps) {
  const t = useTranslations("registration");

  return (
    <div className="space-y-3">
      {roles.map(({ value: roleValue, icon: Icon, key, descKey }) => {
        const isSelected = value === roleValue;

        return (
          <button
            key={roleValue}
            type="button"
            onClick={() => onChange(roleValue)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-start gap-4 ${
              isSelected
                ? "border-secondary bg-secondary/5"
                : "border-divider hover:border-text-secondary"
            }`}
          >
            <div
              className={`p-2 rounded-md ${
                isSelected ? "bg-secondary text-white" : "bg-background text-text-secondary"
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">{t(key)}</p>
              <p className="text-sm text-text-secondary mt-0.5">{t(descKey)}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
