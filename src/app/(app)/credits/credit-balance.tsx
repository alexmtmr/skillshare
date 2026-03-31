"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Info, X } from "lucide-react";

export function CreditBalance({ balance }: { balance: number }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <Card className="!bg-primary text-white !border-none text-center relative">
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
        title="How credits work"
      >
        {showInfo ? (
          <X className="w-5 h-5" />
        ) : (
          <Info className="w-5 h-5" />
        )}
      </button>

      <p className="text-sm opacity-70 uppercase tracking-widest font-bold">
        Your Balance
      </p>
      <p className="text-4xl font-bold mt-2">{balance} Credits</p>

      {showInfo && (
        <div className="mt-4 pt-4 border-t border-white/20 text-left text-sm space-y-2">
          <div className="flex justify-between">
            <span className="opacity-70">Sign up bonus</span>
            <span className="font-bold">+10</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Post a problem</span>
            <span className="font-bold">−1</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Help someone (session)</span>
            <span className="font-bold">+2</span>
          </div>
        </div>
      )}
    </Card>
  );
}
