"use client";

import { useTranslations } from "next-intl";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onGetStarted: () => void;
}

export function WelcomeStep({ onGetStarted }: WelcomeStepProps) {
  const t = useTranslations("registration");

  return (
    <div className="text-center space-y-6 py-4">
      <div className="flex justify-center">
        <div className="p-4 bg-secondary/10 rounded-full">
          <PartyPopper className="w-12 h-12 text-secondary" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-primary">
          {t("step5Title")}
        </h2>
        <p className="mt-2 text-text-secondary">
          {t("welcomeMessage", { credits: 10 })}
        </p>
      </div>
      <Button onClick={onGetStarted} className="w-full">
        {t("getStarted")}
      </Button>
    </div>
  );
}
