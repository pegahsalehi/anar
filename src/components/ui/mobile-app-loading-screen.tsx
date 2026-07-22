import Image from "next/image";

export function MobileAppLoadingScreen() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading Anar"
      className="fixed inset-0 z-[100] overflow-hidden bg-[#FFFCF7] sm:hidden"
      role="status"
    >
      <Image
        alt=""
        aria-hidden="true"
        className="object-cover object-center"
        fill
        priority
        sizes="100vw"
        src="/icons/pwa/loading-page.png"
        unoptimized
      />
    </div>
  );
}
