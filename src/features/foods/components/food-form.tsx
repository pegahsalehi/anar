"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { Heart, ImagePlus, Save, X } from "lucide-react";
import {
  getNutrientInputStyleVariables,
  nutrientPalette,
  type NutrientVariant,
} from "@/components/nutrition/nutrient-theme";
import type { FoodFormValues, FoodMutationState, FoodRow } from "@/features/foods/types";
import { initialFoodMutationState } from "@/features/foods/types";
import {
  formatFoodImageFileSize,
  prepareFoodImageForUpload,
} from "@/features/foods/image-processing";
import { getFoodNumberValidationError } from "@/features/foods/validation";
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

type NutritionFieldName =
  | "caloriesPer100g"
  | "proteinPer100g"
  | "carbohydratesPer100g"
  | "fatPer100g";

type ImageProcessingState =
  | { status: "idle" }
  | { status: "processing" }
  | { status: "ready"; fileSize: number; wasCompressed: boolean };

type FoodFieldErrorName = keyof FoodMutationState["fieldErrors"];

const neutralInputClassName =
  "mt-2 min-h-12 w-full rounded-md border border-[rgb(var(--field-neutral-border))] bg-surface-soft px-3 text-foreground shadow-sm outline-none transition hover:border-[rgb(var(--field-neutral-border-hover))] focus:border-primary focus:ring-4 focus:ring-primary/15";

const neutralTextareaClassName =
  "mt-2 min-h-28 w-full resize-y rounded-md border border-[rgb(var(--field-neutral-border))] bg-surface-soft px-3 py-3 text-foreground shadow-sm outline-none transition hover:border-[rgb(var(--field-neutral-border-hover))] focus:border-primary focus:ring-4 focus:ring-primary/15";

export function FoodForm({ action, food, imageUrl, submitLabel }: FoodFormProps) {
  const [state, formAction] = useActionState(action, initialFoodMutationState);
  const [imageAction, setImageAction] = useState<"keep" | "remove" | "replace">("keep");
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl ?? null);
  const [clientFieldErrors, setClientFieldErrors] = useState<FoodMutationState["fieldErrors"]>(
    {},
  );
  const [imageProcessing, setImageProcessing] = useState<ImageProcessingState>({
    status: "idle",
  });
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
  const caloriesRegistration = register("caloriesPer100g");
  const proteinRegistration = register("proteinPer100g");
  const carbohydratesRegistration = register("carbohydratesPer100g");
  const fatRegistration = register("fatPer100g");
  const selectedFiles = watch("image");
  const selectedFile = selectedFiles?.[0] ?? null;
  const title = useMemo(() => (food ? "Edit food" : "Create food"), [food]);

  const resetImageSelection = useCallback(() => {
    resetField("image");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    setPreviewUrl(imageUrl ?? null);
    setImageAction("keep");
  }, [imageUrl, resetField]);

  const replaceImageInputFile = useCallback((file: File) => {
    if (!imageInputRef.current) {
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    imageInputRef.current.files = dataTransfer.files;
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    let isCurrentSelection = true;
    let objectUrl: string | null = null;

    setImageProcessing({ status: "processing" });
    setClientFieldErrors((currentErrors) => removeFieldError(currentErrors, "image"));

    async function prepareSelectedImage() {
      try {
        const result = await prepareFoodImageForUpload(selectedFile);

        if (!isCurrentSelection) {
          return;
        }

        if (!result.ok) {
          resetImageSelection();
          setClientFieldErrors((currentErrors) => ({
            ...currentErrors,
            image: result.error,
          }));
          setImageProcessing({ status: "idle" });
          return;
        }

        if (result.file !== selectedFile) {
          replaceImageInputFile(result.file);
        }

        objectUrl = URL.createObjectURL(result.file);
        setPreviewUrl(objectUrl);
        setImageAction("replace");
        setImageProcessing({
          status: "ready",
          fileSize: result.file.size,
          wasCompressed: result.wasCompressed,
        });
      } catch (error) {
        if (!isCurrentSelection) {
          return;
        }

        resetImageSelection();
        setClientFieldErrors((currentErrors) => ({
          ...currentErrors,
          image:
            error instanceof Error
              ? error.message
              : "Image could not be prepared. Please choose another image.",
        }));
        setImageProcessing({ status: "idle" });
      }
    }

    prepareSelectedImage();

    return () => {
      isCurrentSelection = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [replaceImageInputFile, resetImageSelection, selectedFile]);

  function removeImage() {
    resetField("image");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    setPreviewUrl(null);
    setImageProcessing({ status: "idle" });
    setClientFieldErrors((currentErrors) => removeFieldError(currentErrors, "image"));
    setImageAction(food?.image_path ? "remove" : "keep");
  }

  function validateClientForm(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const nextErrors: FoodMutationState["fieldErrors"] = {};

    validateNutritionField(nextErrors, "caloriesPer100g", formData.get("caloriesPer100g"));
    validateNutritionField(nextErrors, "proteinPer100g", formData.get("proteinPer100g"));
    validateNutritionField(
      nextErrors,
      "carbohydratesPer100g",
      formData.get("carbohydratesPer100g"),
    );
    validateNutritionField(nextErrors, "fatPer100g", formData.get("fatPer100g"));

    if (imageProcessing.status === "processing") {
      nextErrors.image = "Image is still being prepared. Please wait.";
    }

    setClientFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
    }
  }

  function handleNutritionInputChange(
    field: NutritionFieldName,
    event: ChangeEvent<HTMLInputElement>,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void,
  ) {
    onChange(event);

    const error = getFoodNumberValidationError(event.currentTarget.value);
    setClientFieldErrors((currentErrors) =>
      error
        ? { ...currentErrors, [field]: error }
        : removeFieldError(currentErrors, field),
    );
  }

  function getFieldError(field: FoodFieldErrorName) {
    return clientFieldErrors[field] ?? state.fieldErrors[field];
  }

  return (
    <form
      action={formAction}
      className="grid gap-5 rounded-md border border-border bg-card p-5 shadow-sm"
      onSubmit={validateClientForm}
    >
      <input name="imageAction" type="hidden" value={imageAction} />
      {state.message ? (
        <p className="rounded-md bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-md border border-soft-border bg-surface-soft">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={`${title} preview`} className="h-full w-full object-cover" src={previewUrl} />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <ImagePlus aria-hidden="true" className="h-9 w-9 text-primary" />
                <span className="text-sm font-medium">No image selected</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <label className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-soft-border bg-surface-soft px-4 py-2 text-sm font-semibold text-foreground transition hover:border-[rgb(var(--field-neutral-border-hover))] hover:bg-surface-muted">
              <ImagePlus aria-hidden="true" className="h-4 w-4" />
              Choose image
              <input
                {...imageRegistration}
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => {
                  imageRegistration.onChange(event);
                  setImageProcessing({ status: "idle" });
                  setClientFieldErrors((currentErrors) =>
                    removeFieldError(currentErrors, "image"),
                  );
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
            JPEG, PNG, or WebP. Images over 1 MB are resized before upload.
          </p>
          {imageProcessing.status === "processing" ? (
            <p className="text-xs leading-5 text-muted-foreground">Preparing image...</p>
          ) : null}
          {imageProcessing.status === "ready" ? (
            <p className="text-xs leading-5 text-muted-foreground">
              {imageProcessing.wasCompressed ? "Resized preview" : "Selected image"} - Final
              size: {formatFoodImageFileSize(imageProcessing.fileSize)}
            </p>
          ) : null}
          {getFieldError("image") ? (
            <p className="text-sm text-coral" role="alert">
              {getFieldError("image")}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4">
          <FieldError message={getFieldError("name")}>
            <label className="block">
              <span className="text-sm font-semibold">Food name</span>
              <input
                className={neutralInputClassName}
                placeholder="Walnuts"
                type="text"
                {...register("name")}
              />
            </label>
          </FieldError>
          <p className="text-xs font-semibold leading-5 text-muted-foreground">
            Enter values per 100 g
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <NutritionInputField
              error={getFieldError("caloriesPer100g")}
              field="caloriesPer100g"
              label="Calories"
              onValueChange={handleNutritionInputChange}
              placeholder="654"
              registration={caloriesRegistration}
              variant="calories"
            />
            <NutritionInputField
              error={getFieldError("proteinPer100g")}
              field="proteinPer100g"
              label="Protein"
              onValueChange={handleNutritionInputChange}
              placeholder="15.2"
              registration={proteinRegistration}
              variant="protein"
            />
            <NutritionInputField
              error={getFieldError("carbohydratesPer100g")}
              field="carbohydratesPer100g"
              label="Carbohydrates"
              onValueChange={handleNutritionInputChange}
              placeholder="13.7"
              registration={carbohydratesRegistration}
              variant="carbs"
            />
            <NutritionInputField
              error={getFieldError("fatPer100g")}
              field="fatPer100g"
              label="Fat"
              onValueChange={handleNutritionInputChange}
              placeholder="65.2"
              registration={fatRegistration}
              variant="fat"
            />
          </div>
          <label className="flex min-h-12 items-center gap-3 rounded-md border border-[rgb(var(--field-neutral-border))] bg-surface-soft px-3 shadow-sm transition hover:border-[rgb(var(--field-neutral-border-hover))] focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
            <input className="h-5 w-5 accent-primary" type="checkbox" {...register("isFavorite")} />
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Heart aria-hidden="true" className="h-4 w-4" />
              Mark as favorite
            </span>
          </label>
          <FieldError message={getFieldError("notes")}>
            <label className="block">
              <span className="text-sm font-semibold">Notes</span>
              <textarea
                className={neutralTextareaClassName}
                placeholder="Optional details"
                {...register("notes")}
              />
            </label>
          </FieldError>
        </div>
      </div>
      <div className="flex justify-end">
        <SubmitButton disabled={imageProcessing.status === "processing"}>
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}

function NutritionInputField({
  error,
  field,
  label,
  onValueChange,
  placeholder,
  registration,
  variant,
}: {
  error?: string;
  field: NutritionFieldName;
  label: string;
  onValueChange: (
    field: NutritionFieldName,
    event: ChangeEvent<HTMLInputElement>,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void,
  ) => void;
  placeholder: string;
  registration: UseFormRegisterReturn<NutritionFieldName>;
  variant: NutrientVariant;
}) {
  const errorId = `${field}-error`;

  return (
    <label className="block">
      <span
        className="text-sm font-semibold"
        style={{ color: nutrientPalette[variant].color }}
      >
        {label}
      </span>
      <span
        className={cn(
          "mt-2 flex min-h-12 w-full items-center rounded-md border-2 px-3 shadow-sm transition focus-within:ring-4",
          error
            ? "border-coral bg-coral/5 focus-within:border-coral focus-within:ring-coral/15"
            : "border-[var(--nutrient-input-border)] bg-[var(--nutrient-input-bg)] shadow-[var(--nutrient-input-shadow)] focus-within:border-[var(--nutrient-input-border-focus)] focus-within:ring-[var(--nutrient-input-ring)]",
        )}
        style={getNutrientInputStyleVariables(variant)}
      >
        <input
          {...registration}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
          inputMode="decimal"
          onChange={(event) => onValueChange(field, event, registration.onChange)}
          placeholder={placeholder}
          type="text"
        />
      </span>
      {error ? (
        <span className="mt-2 block text-sm text-coral" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function FieldError({
  children,
  message,
}: {
  children: ReactNode;
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

function SubmitButton({
  children,
  disabled = false,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition",
        "hover:bg-[#49C995] active:bg-[#38B982] disabled:cursor-wait disabled:opacity-70",
      )}
      disabled={pending || disabled}
      type="submit"
    >
      <Save aria-hidden="true" className="h-5 w-5" />
      {pending ? "Saving..." : children}
    </button>
  );
}

function validateNutritionField(
  errors: FoodMutationState["fieldErrors"],
  field: NutritionFieldName,
  value: FormDataEntryValue | null,
) {
  const error = getFoodNumberValidationError(value);

  if (error) {
    errors[field] = error;
  }
}

function removeFieldError(
  errors: FoodMutationState["fieldErrors"],
  field: FoodFieldErrorName,
) {
  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}
