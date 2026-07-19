import Image from "next/image";
import { Check } from "lucide-react";
import { getAvatarOption } from "@/features/profile/avatar-options";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  avatarId?: string | null;
  className?: string;
  imageClassName?: string;
  isSelected?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClassNames = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-20 w-20",
  xl: "h-28 w-28",
};

const imageSizeClassNames = {
  sm: "h-8 w-8",
  md: "h-11 w-11",
  lg: "h-[4.75rem] w-[4.75rem]",
  xl: "h-24 w-24",
};

export function UserAvatar({
  avatarId,
  className,
  imageClassName,
  isSelected = false,
  size = "md",
}: UserAvatarProps) {
  const avatar = getAvatarOption(avatarId);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full border bg-card shadow-sm transition",
        sizeClassNames[size],
        isSelected
          ? "scale-[1.03] border-primary bg-primary/10 shadow-[0_14px_24px_rgb(85_220_164_/_0.22)] ring-4 ring-primary/20"
          : "border-soft-border",
        className,
      )}
    >
      <Image
        alt={`${avatar.label} avatar`}
        className={cn("object-contain", imageSizeClassNames[size], imageClassName)}
        height={1254}
        sizes={getSizes(size)}
        src={avatar.imagePath}
        width={1254}
      />
      {isSelected ? (
        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm">
          <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      ) : null}
    </span>
  );
}

function getSizes(size: NonNullable<UserAvatarProps["size"]>) {
  if (size === "xl") {
    return "112px";
  }

  if (size === "lg") {
    return "80px";
  }

  if (size === "md") {
    return "48px";
  }

  return "36px";
}
