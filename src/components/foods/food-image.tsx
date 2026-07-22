import { DEFAULT_FOOD_IMAGE_SRC } from "@/lib/food-image";
import { cn } from "@/lib/utils";

type FoodImageProps = {
  src: string | null;
  alt: string;
  className?: string;
};

export function FoodImage({ src, alt, className }: FoodImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={cn("h-full w-full rounded-md object-cover", className)}
      loading="lazy"
      src={src ?? DEFAULT_FOOD_IMAGE_SRC}
    />
  );
}
