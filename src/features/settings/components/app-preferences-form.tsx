"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SettingsAccordionCard } from "@/features/settings/components/settings-accordion-card";
import { saveAppPreferencesAction } from "@/features/settings/actions";
import {
  initialAppPreferenceActionState,
  type AppPreferenceValues,
  type TimeFormatPreference,
  type WeekStartsOnPreference,
} from "@/features/settings/types";
import {
  SettingsActionMessage,
  SettingsSubmitButton,
} from "@/features/settings/components/daily-nutrition-targets-form";
import { cn } from "@/lib/utils";

type AppPreferencesFormProps = {
  initialValues: AppPreferenceValues;
};

const weekStartOptions: Array<{
  label: string;
  value: WeekStartsOnPreference;
}> = [
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
];

const timeFormatOptions: Array<{
  label: string;
  value: TimeFormatPreference;
}> = [
  { label: "12-hour", value: "12h" },
  { label: "24-hour", value: "24h" },
];

export function AppPreferencesForm({ initialValues }: AppPreferencesFormProps) {
  const [state, formAction] = useActionState(
    saveAppPreferencesAction,
    initialAppPreferenceActionState,
  );
  const [values, setValues] = useState(initialValues);
  const [savedValues, setSavedValues] = useState(initialValues);
  const pendingValuesRef = useRef<AppPreferenceValues | null>(null);
  const router = useRouter();
  const hasChanges =
    values.weekStartsOn !== savedValues.weekStartsOn ||
    values.timeFormat !== savedValues.timeFormat;

  useEffect(() => {
    if (state.status === "success" && pendingValuesRef.current) {
      setSavedValues(pendingValuesRef.current);
      pendingValuesRef.current = null;
      router.refresh();
    }
  }, [router, state.status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!hasChanges) {
      event.preventDefault();
      return;
    }

    pendingValuesRef.current = values;
  }

  return (
    <SettingsAccordionCard
      description="Choose how dates and times appear across your tracker."
      summary={formatSummary(savedValues)}
      title="App preferences"
    >
      <form action={formAction} onSubmit={handleSubmit}>
        <SettingsActionMessage message={state.message} status={state.status} />

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <PreferenceRadioGroup
            error={state.fieldErrors.weekStartsOn}
            label="Week starts on"
            name="weekStartsOn"
            onChange={(weekStartsOn) => setValues((current) => ({ ...current, weekStartsOn }))}
            options={weekStartOptions}
            value={values.weekStartsOn}
          />
          <PreferenceRadioGroup
            error={state.fieldErrors.timeFormat}
            label="Time format"
            name="timeFormat"
            onChange={(timeFormat) => setValues((current) => ({ ...current, timeFormat }))}
            options={timeFormatOptions}
            value={values.timeFormat}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <SettingsSubmitButton disabled={!hasChanges}>Save preferences</SettingsSubmitButton>
        </div>
      </form>
    </SettingsAccordionCard>
  );
}

function PreferenceRadioGroup<TValue extends string>({
  error,
  label,
  name,
  onChange,
  options,
  value,
}: {
  error?: string;
  label: string;
  name: string;
  onChange: (value: TValue) => void;
  options: Array<{ label: string; value: TValue }>;
  value: TValue;
}) {
  const errorId = `${name}-error`;

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-foreground">{label}</legend>
      <div
        aria-describedby={error ? errorId : undefined}
        className="mt-2 grid grid-cols-2 gap-2 rounded-md border border-soft-border bg-surface-soft p-1"
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <label
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-center rounded-sm border px-3 text-sm font-semibold transition",
                isSelected
                  ? "border-primary/45 bg-primary/15 text-foreground shadow-sm"
                  : "border-transparent text-muted-foreground hover:bg-card hover:text-foreground",
              )}
              key={option.value}
            >
              <input
                checked={isSelected}
                className="sr-only"
                name={name}
                onChange={() => onChange(option.value)}
                type="radio"
                value={option.value}
              />
              {option.label}
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-coral" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function formatSummary(values: AppPreferenceValues) {
  const weekLabel = values.weekStartsOn === "sunday" ? "Sunday" : "Monday";
  const timeLabel = values.timeFormat === "12h" ? "12-hour time" : "24-hour time";

  return `${weekLabel} weeks | ${timeLabel}`;
}
