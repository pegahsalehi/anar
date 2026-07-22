import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type IllustratedEmptyStateProps = {
  action: ReactNode;
  description: string;
  illustrationSrc: string;
  mobileCompact?: boolean;
  title: string;
};

export function IllustratedEmptyState({
  action,
  description,
  illustrationSrc,
  mobileCompact = false,
  title,
}: IllustratedEmptyStateProps) {
  return (
    <section
      className={cn(
        "rounded-[24px] border border-border bg-card shadow-[0_18px_44px_rgb(16_42_67_/_0.06)]",
        mobileCompact
          ? "px-3 py-3 sm:px-8 lg:px-12 lg:py-10"
          : "px-5 py-7 sm:px-8 lg:px-12 lg:py-10",
      )}
      data-mobile-compact={mobileCompact ? "true" : undefined}
    >
      <div
        className={cn(
          "grid items-center",
          mobileCompact
            ? "grid-cols-[4.75rem_minmax(0,1fr)] gap-3 text-left sm:grid-cols-[13rem_1fr] sm:gap-7 lg:grid-cols-[15rem_1fr] lg:gap-10"
            : "gap-7 text-center sm:grid-cols-[13rem_1fr] sm:text-left lg:grid-cols-[15rem_1fr] lg:gap-10",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center overflow-hidden bg-muted shadow-[0_12px_30px_rgb(16_42_67_/_0.06)]",
            mobileCompact
              ? "h-[4.75rem] w-[4.75rem] rounded-[18px] sm:mx-0 sm:h-48 sm:w-48 sm:rounded-[28px] lg:h-56 lg:w-56"
              : "mx-auto h-48 w-48 rounded-[28px] sm:mx-0 lg:h-56 lg:w-56",
          )}
        >
          <Image
            alt=""
            aria-hidden="true"
            className="h-full w-full object-contain"
            height={1254}
            src={illustrationSrc}
            width={1254}
          />
        </div>
        <div
          className={cn(
            "min-w-0",
            mobileCompact ? "max-w-none sm:mx-0 sm:max-w-xl" : "mx-auto max-w-xl sm:mx-0",
          )}
        >
          <h3
            className={cn(
              "font-semibold leading-tight text-card-foreground",
              mobileCompact ? "text-base sm:text-2xl" : "text-2xl",
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "text-muted-foreground",
              mobileCompact
                ? "mt-1 text-xs leading-5 sm:mt-3 sm:text-lg sm:leading-7"
                : "mt-3 text-base leading-7 sm:text-lg",
            )}
          >
            {description}
          </p>
          <div
            className={cn(
              "flex",
              mobileCompact ? "mt-2 justify-start sm:mt-6" : "mt-6 justify-center sm:justify-start",
            )}
          >
            {action}
          </div>
        </div>
      </div>
    </section>
  );
}
