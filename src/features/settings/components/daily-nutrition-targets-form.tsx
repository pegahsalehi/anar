"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { SettingsAccordionCard } from "@/features/settings/components/settings-accordion-card";
import { saveDailyNutritionTargetsAction } from "@/features/settings/actions";
import {
  NutrientSurface,
  nutrientPalette,
  type NutrientVariant,
} from "@/components/nutrition/nutrient-theme";
import {
  initialDailyNutritionTargetActionState,
  type DailyNutritionTargetField,
  type DailyNutritionTargetValues,
} from "@/features/settings/types";
import { formatDecimal, formatInteger } from "@/lib/format";
import {
  getGoalNumberValidationError,
  validateDailyNutritionTargetFormData,
} from "@/features/settings/validation";
import { cn } from "@/lib/utils";

type DailyNutritionTargetsFormProps = {
  effectiveDate: string;
  initialValues: DailyNutritionTargetValues;
};

const nutrients: Array<{
  label: string;
  name: DailyNutritionTargetField;
  unit: "cal" | "g";
  variant: NutrientVariant;
}> = [
  {
    label: "Calories",
    name: "caloriesTarget",
    unit: "cal",
    variant: "calories",
  },
  {
    label: "Protein",
    name: "proteinTarget",
    unit: "g",
    variant: "protein",
  },
  {
    label: "Carbs",
    name: "carbohydratesTarget",
    unit: "g",
    variant: "carbs",
  },
  {
    label: "Fat",
    name: "fatTarget",
    unit: "g",
    variant: "fat",
  },
];

export function DailyNutritionTargetsForm({
  effectiveDate,
  initialValues,
}: DailyNutritionTargetsFormProps) {
  const [state, formAction] = useActionState(
    saveDailyNutritionTargetsAction,
    initialDailyNutritionTargetActionState,
  );
  const [clientFieldErrors, setClientFieldErrors] =
    useState<typeof state.fieldErrors>({});
  const [savedValues, setSavedValues] = useState(initialValues);
  const pendingValuesRef = useRef<DailyNutritionTargetValues | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      setClientFieldErrors({});
      if (pendingValuesRef.current) {
        setSavedValues(pendingValuesRef.current);
        pendingValuesRef.current = null;
      }
      router.refresh();
    }
  }, [router, state]);

  function validateClientForm(event: FormEvent<HTMLFormElement>) {
    const result = validateDailyNutritionTargetFormData(new FormData(event.currentTarget));

    if (!result.ok) {
      pendingValuesRef.current = null;
      setClientFieldErrors(result.fieldErrors);
      event.preventDefault();
      return;
    }

    pendingValuesRef.current = result.values;
    setClientFieldErrors({});
  }

  function handleInputChange(field: DailyNutritionTargetField, event: ChangeEvent<HTMLInputElement>) {
    const error = getGoalNumberValidationError(event.currentTarget.value);
    setClientFieldErrors((currentErrors) =>
      error
        ? { ...currentErrors, [field]: error }
        : removeFieldError(currentErrors, field),
    );
  }

  function getFieldError(field: DailyNutritionTargetField) {
    return clientFieldErrors[field] ?? state.fieldErrors[field];
  }

  const summary = formatDailyNutritionTargetSummary(savedValues);

  return (
    <SettingsAccordionCard
      defaultOpen
      description="Set the daily nutrition targets Anar should use from today forward."
      summary={summary}
      title="Daily nutrition targets"
    >
      {effectiveDate ? (
        <span className="inline-flex w-fit rounded-sm border border-effective-badge-border bg-effective-badge px-3 py-1.5 text-xs font-semibold text-effective-badge-foreground">
          Effective {effectiveDate}
        </span>
      ) : null}

      <form action={formAction} className="mt-5" onSubmit={validateClientForm}>
        <SettingsActionMessage message={state.message} status={state.status} />

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {nutrients.map((nutrient) => (
            <NutrientSurface
              as="section"
              className="p-4"
              key={nutrient.variant}
              variant={nutrient.variant}
            >
              <h3
                className="text-sm font-semibold"
                style={{ color: nutrientPalette[nutrient.variant].color }}
              >
                {nutrient.label}
              </h3>
              <div className="mt-3">
                <GoalInput
                  defaultValue={initialValues[nutrient.name]}
                  error={getFieldError(nutrient.name)}
                  label="Daily target"
                  name={nutrient.name}
                  onChange={handleInputChange}
                  unit={nutrient.unit}
                />
              </div>
            </NutrientSurface>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <SettingsSubmitButton>Save targets</SettingsSubmitButton>
        </div>
      </form>
    </SettingsAccordionCard>
  );
}

function GoalInput({
  defaultValue,
  error,
  label,
  name,
  onChange,
  unit,
}: {
  defaultValue: number;
  error?: string;
  label: string;
  name: DailyNutritionTargetField;
  onChange: (field: DailyNutritionTargetField, event: ChangeEvent<HTMLInputElement>) => void;
  unit: "cal" | "g";
}) {
  const errorId = `${name}-error`;

  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span
        className={cn(
          "mt-1.5 flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-3 shadow-sm transition focus-within:ring-4",
          "focus-within:border-[var(--nutrient-color)] focus-within:ring-[var(--nutrient-ring)]",
          error && "border-coral focus-within:border-coral focus-within:ring-coral/15",
        )}
      >
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
          defaultValue={defaultValue}
          inputMode="decimal"
          name={name}
          onChange={(event) => onChange(name, event)}
          type="text"
        />
        <span
          className="shrink-0 text-xs font-semibold"
          style={{ color: "var(--nutrient-color)" }}
        >
          {unit}
        </span>
      </span>
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-coral" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function SettingsActionMessage({
  message,
  status,
}: {
  message: string | null;
  status: "idle" | "error" | "success";
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={cn(
        "mt-4 rounded-md border px-3.5 py-3 text-sm font-medium leading-6",
        status === "success"
          ? "border-primary/40 bg-primary/15 text-foreground"
          : "border-coral/25 bg-coral/10 text-coral",
      )}
      role={status === "error" ? "alert" : "status"}
    >
      {message}
    </p>
  );
}

export function SettingsSubmitButton({
  children,
  disabled = false,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#49C995] active:bg-[#38B982] disabled:cursor-wait disabled:opacity-70"
      disabled={pending || disabled}
      type="submit"
    >
      <Save aria-hidden="true" className="h-4 w-4" />
      {pending ? "Saving..." : children}
    </button>
  );
}

function removeFieldError(
  errors: Partial<Record<DailyNutritionTargetField, string>>,
  field: DailyNutritionTargetField,
) {
  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}

function formatDailyNutritionTargetSummary(values: DailyNutritionTargetValues) {
  return [
    `Calories ${formatInteger(values.caloriesTarget)} cal`,
    `Protein ${formatDecimal(values.proteinTarget)} g`,
    `Carbs ${formatDecimal(values.carbohydratesTarget)} g`,
    `Fat ${formatDecimal(values.fatTarget)} g`,
  ].join(" | ");
}
