"use client";

import {
  useActionState,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { saveDailyGoalRangesAction } from "@/features/settings/actions";
import {
  initialDailyGoalRangeActionState,
  type DailyGoalRangeField,
  type DailyGoalRangeValues,
} from "@/features/settings/types";
import {
  getGoalNumberValidationError,
  validateDailyGoalRangeFormData,
} from "@/features/settings/validation";
import { cn } from "@/lib/utils";

type DailyGoalRangesFormProps = {
  effectiveDate: string;
  initialValues: DailyGoalRangeValues;
};

const nutrients: Array<{
  label: string;
  minName: DailyGoalRangeField;
  maxName: DailyGoalRangeField;
  unit: "cal" | "g";
}> = [
  {
    label: "Calories",
    minName: "caloriesMin",
    maxName: "caloriesMax",
    unit: "cal",
  },
  {
    label: "Protein",
    minName: "proteinMin",
    maxName: "proteinMax",
    unit: "g",
  },
  {
    label: "Carbs",
    minName: "carbohydratesMin",
    maxName: "carbohydratesMax",
    unit: "g",
  },
  {
    label: "Fat",
    minName: "fatMin",
    maxName: "fatMax",
    unit: "g",
  },
];

export function DailyGoalRangesForm({
  effectiveDate,
  initialValues,
}: DailyGoalRangesFormProps) {
  const [state, formAction] = useActionState(
    saveDailyGoalRangesAction,
    initialDailyGoalRangeActionState,
  );
  const [clientFieldErrors, setClientFieldErrors] =
    useState<typeof state.fieldErrors>({});

  useEffect(() => {
    if (state.status === "success") {
      setClientFieldErrors({});
    }
  }, [state.status]);

  function validateClientForm(event: FormEvent<HTMLFormElement>) {
    const result = validateDailyGoalRangeFormData(new FormData(event.currentTarget));

    if (!result.ok) {
      setClientFieldErrors(result.fieldErrors);
      event.preventDefault();
      return;
    }

    setClientFieldErrors({});
  }

  function handleInputChange(field: DailyGoalRangeField, event: ChangeEvent<HTMLInputElement>) {
    const error = getGoalNumberValidationError(event.currentTarget.value);
    setClientFieldErrors((currentErrors) =>
      error
        ? { ...currentErrors, [field]: error }
        : removeFieldError(currentErrors, field),
    );
  }

  function getFieldError(field: DailyGoalRangeField) {
    return clientFieldErrors[field] ?? state.fieldErrors[field];
  }

  return (
    <form
      action={formAction}
      className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6"
      onSubmit={validateClientForm}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">Daily goal ranges</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Set the nutrition range Anar should use from today forward.
          </p>
        </div>
        {effectiveDate ? (
          <span className="inline-flex w-fit rounded-sm bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            Effective {effectiveDate}
          </span>
        ) : null}
      </div>

      <SettingsActionMessage message={state.message} status={state.status} />

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {nutrients.map((nutrient) => (
          <section
            className="rounded-md border border-border bg-background/60 p-4"
            key={nutrient.label}
          >
            <h3 className="text-sm font-semibold text-foreground">{nutrient.label}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <GoalInput
                defaultValue={initialValues[nutrient.minName]}
                error={getFieldError(nutrient.minName)}
                label="Minimum"
                name={nutrient.minName}
                onChange={handleInputChange}
                unit={nutrient.unit}
              />
              <GoalInput
                defaultValue={initialValues[nutrient.maxName]}
                error={getFieldError(nutrient.maxName)}
                label="Maximum"
                name={nutrient.maxName}
                onChange={handleInputChange}
                unit={nutrient.unit}
              />
            </div>
          </section>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <SettingsSubmitButton>Save goal ranges</SettingsSubmitButton>
      </div>
    </form>
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
  name: DailyGoalRangeField;
  onChange: (field: DailyGoalRangeField, event: ChangeEvent<HTMLInputElement>) => void;
  unit: "cal" | "g";
}) {
  const errorId = `${name}-error`;

  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span
        className={cn(
          "mt-1.5 flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-3 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20",
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
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">{unit}</span>
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

export function SettingsSubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#49C995] active:bg-[#38B982] disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      <Save aria-hidden="true" className="h-4 w-4" />
      {pending ? "Saving..." : children}
    </button>
  );
}

function removeFieldError(
  errors: Partial<Record<DailyGoalRangeField, string>>,
  field: DailyGoalRangeField,
) {
  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}
