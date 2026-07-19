import Image from "next/image";
import type { ReactNode } from "react";

type IllustratedEmptyStateProps = {
  action: ReactNode;
  description: string;
  illustrationSrc: string;
  title: string;
};

export function IllustratedEmptyState({
  action,
  description,
  illustrationSrc,
  title,
}: IllustratedEmptyStateProps) {
  return (
    <section className="rounded-[24px] border border-border bg-card px-5 py-7 shadow-[0_18px_44px_rgb(16_42_67_/_0.06)] sm:px-8 lg:px-12 lg:py-10">
      <div className="grid items-center gap-7 text-center sm:grid-cols-[13rem_1fr] sm:text-left lg:grid-cols-[15rem_1fr] lg:gap-10">
        <div className="mx-auto flex h-48 w-48 items-center justify-center overflow-hidden rounded-[28px] bg-muted shadow-[0_12px_30px_rgb(16_42_67_/_0.06)] sm:mx-0 lg:h-56 lg:w-56">
          <Image
            alt=""
            aria-hidden="true"
            className="h-full w-full object-contain"
            height={1254}
            src={illustrationSrc}
            width={1254}
          />
        </div>
        <div className="mx-auto max-w-xl sm:mx-0">
          <h3 className="text-2xl font-semibold leading-tight text-card-foreground">
            {title}
          </h3>
          <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
          <div className="mt-6 flex justify-center sm:justify-start">{action}</div>
        </div>
      </div>
    </section>
  );
}
