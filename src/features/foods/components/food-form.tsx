"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { Heart, ImagePlus, Save, X } from "lucide-react";
import type { FoodFormValues, FoodMutationState, FoodRow } from "@/features/foods/types";
import { initialFoodMutationState } from "@/features/foods/types";
import { cn } from "@/lib/utils";

type FoodFormAction = (
  previousState: FoodMutationState,
  formData: FormData,
) => Promise<FoodMutationState>;

type FoodFormProps = {
  action: FoodFormAction;
  food?: FoodRow;
  imageUrl?: string | null;
  submitLabel: string;
};

type RegisteredFoodFormValues = FoodFormValues & {
  image: FileList;
};

export function FoodForm({ action, food, imageUrl, submitLabel }: FoodFormProps) {
  const [state, formAction] = useActionState(action, initialFoodMutationState);
  const [imageAction, setImageAction] = useState<"keep" | "remove" | "replace">("keep");
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl ?? null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const { register, resetField, watch } = useForm<RegisteredFoodFormValues>({
    defaultValues: {
      name: food?.name ?? "",
      caloriesPer100g: food ? String(food.calories_per_100g) : "",
      proteinPer100g: food ? String(food.protein_per_100g) : "",
      carbohydratesPer100g: food ? String(food.carbohydrates_per_100g) : "",
      fatPer100g: food ? String(food.fat_per_100g) : "",
      notes: food?.notes ?? "",
      isFavorite: food?.is_favorite ?? false,
    },
  });

  const imageRegistration = register("image");
  const selectedFiles = watch("image");
  const selectedFile = selectedFiles?.[0] ?? null;

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    setImageAction("replace");

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const title = useMemo(() => (food ? "Edit food" : "Create food"), [food]);

  function removeImage() {
    resetField("image");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    setPreviewUrl(null);
    setImageAction(food?.image_path ? "remove" : "keep");
  }

  return (
    <form action={formAction} className="grid gap-5 rounded-md border border-border bg-card p-5 shadow-sm">
      <input name="imageAction" type="hidden" value={imageAction} />
      {state.message ? (
        <p className="rounded-md bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={`${title} preview`} className="h-full w-full object-cover" src={previewUrl} />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <ImagePlus aria-hidden="true" className="h-9 w-9 text-fresh" />
                <span className="text-sm font-semibold">No image selected</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <label className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:bg-muted">
              <ImagePlus aria-hidden="true" className="h-4 w-4" />
              Choose image
              <input
                {...imageRegistration}
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => {
                  imageRegistration.onChange(event);
                }}
                ref={(element) => {
                  imageRegistration.ref(element);
                  imageInputRef.current = element;
                }}
                type="file"
              />
            </label>
            {previewUrl ? (
              <button
                aria-label="Remove image"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-coral hover:text-coral"
                onClick={removeImage}
                type="button"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            JPEG, PNG, or WebP. Maximum size: 2 MB.
          </p>
          {state.fieldErrors.image ? (
            <p className="text-sm text-coral" role="alert">
              {state.fieldErrors.image}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4">
          <FieldError message={state.fieldErrors.name}>
            <label className="block">
              <span className="text-sm font-semibold">Food name</span>
              <input
                className="mt-2 min-h-12 w-full rounded-md border border-border bg-background px-3 outline-none transition focus:border-primary"
                placeholder="Walnuts"
                type="text"
                {...register("name")}
              />
            </label>
          </FieldError>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <FieldError message={state.fieldErrors.caloriesPer100g}>
              <label className="block">
                <span className="text-sm font-semibold">Calories per 100 g</span>
                <input
                  className="mt-2 min-h-12 w-full rounded-md border border-border bg-background px-3 outline-none transition focus:border-primary"
                  inputMode="decimal"
                  placeholder="654"
                  type="text"
                  {...register("caloriesPer100g")}
                />
              </label>
            </FieldError>
            <FieldError message={state.fieldErrors.proteinPer100g}>
              <label className="block">
                <span className="text-sm font-semibold">Protein</span>
                <input
                  className="mt-2 min-h-12 w-full rounded-md border border-border bg-background px-3 outline-none transition focus:border-primary"
                  inputMode="decimal"
                  placeholder="15.2"
                  type="text"
                  {...register("proteinPer100g")}
                />
              </label>
            </FieldError>
            <FieldError message={state.fieldErrors.carbohydratesPer100g}>
              <label className="block">
                <span className="text-sm font-semibold">Carbohydrates</span>
                <input
                  className="mt-2 min-h-12 w-full rounded-md border border-border bg-background px-3 outline-none transition focus:border-primary"
                  inputMode="decimal"
                  placeholder="13.7"
                  type="text"
                  {...register("carbohydratesPer100g")}
                />
              </label>
            </FieldError>
            <FieldError message={state.fieldErrors.fatPer100g}>
              <label className="block">
                <span className="text-sm font-semibold">Fat</span>
                <input
                  className="mt-2 min-h-12 w-full rounded-md border border-border bg-background px-3 outline-none transition focus:border-primary"
                  inputMode="decimal"
                  placeholder="65.2"
                  type="text"
                  {...register("fatPer100g")}
                />
              </label>
            </FieldError>
          </div>
          <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-background px-3">
            <input className="h-5 w-5 accent-primary" type="checkbox" {...register("isFavorite")} />
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Heart aria-hidden="true" className="h-4 w-4" />
              Mark as favorite
            </span>
          </label>
          <FieldError message={state.fieldErrors.notes}>
            <label className="block">
              <span className="text-sm font-semibold">Notes</span>
              <textarea
                className="mt-2 min-h-28 w-full resize-y rounded-md border border-border bg-background px-3 py-3 outline-none transition focus:border-primary"
                placeholder="Optional details"
                {...register("notes")}
              />
            </label>
          </FieldError>
        </div>
      </div>
      <div className="flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

function FieldError({
  children,
  message,
}: {
  children: React.ReactNode;
  message?: string;
}) {
  return (
    <div>
      {children}
      {message ? (
        <p className="mt-2 text-sm text-coral" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft transition",
        "hover:bg-[#59CF95] active:bg-[#3FBD7E] disabled:cursor-wait disabled:opacity-70",
      )}
      disabled={pending}
      type="submit"
    >
      <Save aria-hidden="true" className="h-5 w-5" />
      {pending ? "Saving..." : children}
    </button>
  );
}
