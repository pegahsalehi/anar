import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type AnarLogoVariant = "nav" | "compact" | "auth";

type AnarLogoProps = {
  className?: string;
  compact?: boolean;
  decorative?: boolean;
  href?: string | null;
  imageClassName?: string;
  imageSizes?: string;
  variant?: AnarLogoVariant;
};

const logoAssets = {
  nav: {
    className: "h-auto w-[128px] max-w-full sm:w-[138px]",
    height: 1023,
    priority: true,
    sizes: "145px",
    src: "/brand/anar-logo.png",
    width: 2456,
  },
  compact: {
    className: "h-10 w-10",
    height: 1023,
    priority: false,
    sizes: "40px",
    src: "/brand/anar-icon.png",
    width: 1023,
  },
  auth: {
    className: "h-auto w-[160px] max-w-full sm:w-[190px] md:w-[210px]",
    height: 1697,
    priority: true,
    sizes: "(min-width: 768px) 210px, (min-width: 640px) 190px, 160px",
    src: "/brand/anar-icon-login.png",
    width: 1429,
  },
};

export function AnarLogo({
  className,
  compact = false,
  decorative = false,
  href = "/today",
  imageClassName,
  imageSizes,
  variant,
}: AnarLogoProps) {
  const resolvedVariant = variant ?? (compact ? "compact" : "nav");
  const isAuth = resolvedVariant === "auth";
  const asset = logoAssets[resolvedVariant];
  const content = (
    <Image
      alt={decorative ? "" : "Anar"}
      className={cn("block object-contain", asset.className, imageClassName)}
      height={asset.height}
      priority={asset.priority}
      sizes={imageSizes ?? asset.sizes}
      src={asset.src}
      width={asset.width}
    />
  );

  const classes = cn(
    "inline-flex min-w-0 items-center",
    isAuth && "w-full justify-center",
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
