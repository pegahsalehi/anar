import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function AuthLoading() {
  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center">
        <LoadingSkeleton className="h-96 w-full rounded-md" />
      </div>
    </main>
  );
}
