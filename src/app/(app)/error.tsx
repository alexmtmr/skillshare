"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="text-center max-w-sm py-10 px-6">
        <AlertTriangle className="w-12 h-12 text-star mx-auto mb-4" />
        <h2 className="text-lg font-bold text-primary">
          Something went wrong
        </h2>
        <p className="text-sm text-text-secondary mt-2">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={reset} className="mt-6">
          Try again
        </Button>
      </Card>
    </div>
  );
}
