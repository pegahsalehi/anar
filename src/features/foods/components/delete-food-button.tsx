"use client";

import { useRef, useState } from "react";
import { Trash2, X } from "lucide-react";
import { softDeleteFoodAction } from "@/features/foods/actions";

type DeleteFoodButtonProps = {
  foodId: string;
  foodName: string;
};

export function DeleteFoodButton({ foodId, foodName }: DeleteFoodButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const action = softDeleteFoodAction.bind(null, foodId);

  return (
    <>
      <button
        aria-label={`Delete ${foodName}`}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-coral hover:text-coral"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Trash2 aria-hidden="true" className="h-4 w-4" />
      </button>
      {isOpen ? (
        <div
          aria-modal="true"
          aria-labelledby="delete-food-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 backdrop-blur-sm"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          role="dialog"
        >
          <div
            className="w-full max-w-md rounded-md border border-border bg-card p-5 shadow-soft"
            ref={dialogRef}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground" id="delete-food-title">
                  Delete food?
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This will remove <strong className="text-foreground">{foodName}</strong> from
                  your library. Existing log snapshots will stay unchanged.
                </p>
              </div>
              <button
                aria-label="Close dialog"
                className="flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <form action={action}>
                <button
                  className="min-h-11 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-coral-foreground transition hover:bg-coral/90"
                  type="submit"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
