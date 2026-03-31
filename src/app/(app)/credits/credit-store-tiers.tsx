"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const tiers = [
  { name: "Starter", credits: 5, price: "$4.99" },
  { name: "Standard", credits: 12, price: "$9.99", popular: true },
  { name: "Pro", credits: 30, price: "$19.99" },
];

export function CreditStoreTiers({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleMockPurchase(tierName: string, credits: number) {
    setLoading(tierName);
    const supabase = createClient();

    // Add credits to profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", userId)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({ credits_balance: profile.credits_balance + credits })
        .eq("id", userId);

      await supabase.from("transactions").insert({
        user_id: userId,
        type: "purchase",
        amount: credits,
        description: `Purchased ${tierName} package (${credits} credits)`,
      });
    }

    setLoading(null);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tiers.map((tier) => (
        <Card
          key={tier.name}
          className={`text-center relative ${
            tier.popular ? "border-secondary border-2" : ""
          }`}
        >
          {tier.popular && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-secondary text-white text-[10px] font-bold uppercase rounded-full">
              Most Popular
            </span>
          )}
          <p className="text-sm font-bold text-text-secondary uppercase">
            {tier.name}
          </p>
          <p className="text-3xl font-bold text-primary mt-2">
            {tier.credits}
          </p>
          <p className="text-xs text-text-secondary">credits</p>
          <p className="text-lg font-bold text-primary mt-3">{tier.price}</p>
          <Button
            onClick={() => handleMockPurchase(tier.name, tier.credits)}
            loading={loading === tier.name}
            className="w-full mt-4"
          >
            Buy
          </Button>
        </Card>
      ))}
    </div>
  );
}
