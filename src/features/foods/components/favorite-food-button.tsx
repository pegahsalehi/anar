"use client";

import { Heart } from "lucide-react";
import { offlineMutationMessage, useOnlineStatus } from "@/components/pwa/online-status";
import { toggleFavoriteFoodAction } from "@/features/foods/actions";
import { cn } from "@/lib/utils";

type FavoriteFoodButtonProps = {
  foodId: string;
  isFavorite: boolean;
};

export function FavoriteFoodButton({ foodId, isFavorite }: FavoriteFoodButtonProps) {
  const action = toggleFavoriteFoodAction.bind(null, foodId, !isFavorite);
  const { isOnline } = useOnlineStatus();
  const label = isFavorite ? "Remove from favorites" : "Add to favorites";

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!isOnline) {
          event.preventDefault();
        }
      }}
    >
      <button
        aria-label={isOnline ? label : `${label}. ${offlineMutationMessage}`}
        className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition hover:bg-surface-soft hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        disabled={!isOnline}
        title={!isOnline ? offlineMutationMessage : undefined}
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
