import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto w-full space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-32 rounded-lg" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-20 rounded-lg" />
    </div>
  );
}
