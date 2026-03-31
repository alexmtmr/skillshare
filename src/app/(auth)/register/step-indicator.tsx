interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div
            key={stepNum}
            className={`h-2 rounded-full transition-all ${
              isActive
                ? "w-8 bg-secondary"
                : isCompleted
                  ? "w-2 bg-secondary"
                  : "w-2 bg-divider"
            }`}
          />
        );
      })}
    </div>
  );
}
