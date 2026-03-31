import { Skeleton } from "@/components/ui/skeleton";

export default function BrowseLoading() {
  return (
    <div className="p-6 md:p-10 flex-1 flex flex-col items-center">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-16 mx-auto" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-full shrink-0" />
          <Skeleton className="h-80 rounded-lg flex-1" />
          <Skeleton className="w-11 h-11 rounded-full shrink-0" />
        </div>
        <Skeleton className="h-14 w-48 rounded-full mx-auto" />
      </div>
    </div>
  );
}
