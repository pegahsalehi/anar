import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type AnarLogoVariant = "nav" | "compact" | "auth";

type AnarLogoProps = {
  className?: string;
  compact?: boolean;
  decorative?: boolean;
  href?: string | null;
  variant?: AnarLogoVariant;
};

const logoDimensions = {
  nav: {
    wrapper: "h-12 w-10",
    imageSizes: "48px",
    wordmark: "text-xl",
  },
  compact: {
    wrapper: "h-10 w-8",
    imageSizes: "40px",
    wordmark: "text-lg",
  },
  auth: {
    wrapper: "h-24 w-20",
    imageSizes: "90px",
    wordmark: "text-2xl",
  },
};

export function AnarLogo({
  className,
  compact = false,
  decorative = false,
  href = "/today",
  variant,
}: AnarLogoProps) {
  const resolvedVariant = variant ?? (compact ? "compact" : "nav");
  const isAuth = resolvedVariant === "auth";
  const shouldShowWordmark = resolvedVariant !== "compact";
  const dimensions = logoDimensions[resolvedVariant];
  const content = (
    <>
      <span className={cn("relative shrink-0", dimensions.wrapper)}>
        <Image
          alt={decorative ? "" : "Anar logo"}
          className="object-contain"
          fill
          priority={resolvedVariant !== "compact"}
          sizes={dimensions.imageSizes}
          src="/brand/anar-logo.png"
        />
      </span>
      {shouldShowWordmark ? (
        <span
          className={cn(
            "font-semibold leading-none text-primary-foreground",
            dimensions.wordmark,
          )}
        >
          Anar
        </span>
      ) : null}
    </>
  );

  const classes = cn(
    "inline-flex items-center gap-3",
    isAuth && "flex-col justify-center gap-3 text-center",
    className,
  );

  if (!href) {
    return (
      <div aria-hidden={decorative || undefined} className={classes}>
        {content}
      </div>
    );
  }

  return (
    <Link
      aria-label={decorative ? undefined : "Anar home"}
      className={cn(classes, "rounded-md transition hover:opacity-85 focus-visible:opacity-100")}
      href={href}
    >
      {content}
    </Link>
  );
}
