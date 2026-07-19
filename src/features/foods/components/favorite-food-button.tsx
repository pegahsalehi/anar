import { Heart } from "lucide-react";
import { toggleFavoriteFoodAction } from "@/features/foods/actions";
import { cn } from "@/lib/utils";

type FavoriteFoodButtonProps = {
  foodId: string;
  isFavorite: boolean;
};

export function FavoriteFoodButton({ foodId, isFavorite }: FavoriteFoodButtonProps) {
  const action = toggleFavoriteFoodAction.bind(null, foodId, !isFavorite);

  return (
    <form action={action}>
      <button
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:border-coral hover:text-coral"
        type="submit"
      >
        <Heart
          aria-hidden="true"
          className={cn("h-5 w-5", isFavorite && "fill-coral text-coral")}
        />
      </button>
    </form>
  );
}
