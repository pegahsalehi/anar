import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FoodImageProps = {
  src: string | null;
  alt: string;
  className?: string;
};

export function FoodImage({ src, alt, className }: FoodImageProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        className={cn("h-full w-full rounded-md object-cover", className)}
        loading="lazy"
        src={src}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-full w-full items-center justify-center rounded-md bg-muted text-fresh",
        className,
      )}
    >
      <ImageIcon className="h-6 w-6" />
    </div>
  );
}
