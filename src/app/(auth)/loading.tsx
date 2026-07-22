import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { MobileAppLoadingScreen } from "@/components/ui/mobile-app-loading-screen";

export default function AuthLoading() {
  return (
    <main className="min-h-screen px-5 py-8">
      <MobileAppLoadingScreen />
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center">
        <LoadingSkeleton className="hidden h-96 w-full rounded-md sm:block" />
      </div>
    </main>
  );
}
