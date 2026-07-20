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
        className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:border-primary/70 hover:text-foreground"
        type="submit"
      >
        <Heart
          aria-hidden="true"
          className={cn("h-[1.125rem] w-[1.125rem]", isFavorite && "fill-primary text-primary")}
        />
      </button>
    </form>
  );
}
