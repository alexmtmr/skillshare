import { Skeleton } from "@/components/ui/skeleton";

export default function SessionsLoading() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto w-full space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-32" />
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <Skeleton className="h-5 w-32" />
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-lg" />
      </div>
    </div>
  );
}
