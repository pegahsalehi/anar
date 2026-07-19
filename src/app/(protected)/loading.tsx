import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function ProtectedLoading() {
  return (
    <div className="space-y-5">
      <LoadingSkeleton className="h-24 w-full rounded-md" />
      <div className="grid gap-4 md:grid-cols-3">
        <LoadingSkeleton className="h-36 rounded-md" />
        <LoadingSkeleton className="h-36 rounded-md" />
        <LoadingSkeleton className="h-36 rounded-md" />
      </div>
      <LoadingSkeleton className="h-72 w-full rounded-md" />
    </div>
  );
}
