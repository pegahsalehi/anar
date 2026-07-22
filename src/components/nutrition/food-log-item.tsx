"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { FoodImage } from "@/components/foods/food-image";
import {
  OfflineMutationNotice,
  offlineMutationMessage,
  useOnlineStatus,
} from "@/components/pwa/online-status";
import {
  deleteFoodLogAction,
  updateFoodLogGramsAction,
} from "@/features/today/actions";
import { formatCalories, formatDecimal, formatGram } from "@/lib/format";

export type FoodLogListItem = {
  id: string;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  time: string;
  imageUrl?: string | null;
};

type FoodLogItemProps = {
  log: FoodLogListItem;
  editable?: boolean;
};

export function FoodLogItem({ log, editable = true }: FoodLogItemProps) {
  const updateAction = updateFoodLogGramsAction.bind(null, log.id);
  const deleteAction = deleteFoodLogAction.bind(null, log.id);
  const gramsInputId = `food-log-${log.id}-grams`;
  const { isOnline } = useOnlineStatus();

  return (
    <article className="relative grid grid-cols-[minmax(0,1fr)_2.5rem] gap-x-1.5 overflow-visible rounded-md border border-border border-l-[3px] border-l-primary/70 bg-card px-2.5 py-2 sm:flex sm:items-center sm:gap-4 sm:px-4 sm:py-3">
      <div className="col-start-1 row-start-1 flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
        <span
          aria-hidden="true"
          className="absolute -left-[5px] top-5 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary shadow-sm"
        />
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md sm:h-12 sm:w-12">
          <FoodImage alt={`${log.name} image`} src={log.imageUrl ?? null} />
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 sm:gap-x-2 sm:gap-y-1">
            <h3 className="min-w-0 truncate text-[0.82rem] font-semibold leading-5 text-card-foreground sm:text-base">
              {log.name}
            </h3>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.68rem] font-semibold leading-4 text-foreground">
              Logged
            </span>
          </div>
          <p className="text-xs font-semibold leading-5 text-foreground sm:mt-0.5 sm:text-sm">
            {formatGram(log.grams)}
            <span className="font-medium text-muted-foreground"> · {log.time}</span>
          </p>
        </div>
      </div>
      <div className="contents sm:mt-0 sm:flex sm:items-center sm:justify-end sm:gap-2">
        <dl className="col-start-1 row-start-2 mt-1.5 grid min-w-0 flex-1 grid-cols-4 gap-1 text-[0.62rem] sm:mt-0 sm:flex sm:flex-none sm:flex-wrap sm:items-center sm:justify-end sm:gap-1.5 sm:text-xs">
          <CompactNutrient label="Calories" shortLabel="Cal" value={formatCalories(log.calories)} />
          <CompactNutrient label="Protein" shortLabel="Pro" value={`${formatDecimal(log.protein)} g`} />
          <CompactNutrient
            label="Carbs"
            shortLabel="Carb"
            value={`${formatDecimal(log.carbohydrates)} g`}
          />
          <CompactNutrient label="Fat" shortLabel="Fat" value={`${formatDecimal(log.fat)} g`} />
        </dl>
        {editable ? (
          <div className="col-start-2 row-span-2 row-start-1 flex shrink-0 flex-col gap-1.5 self-start sm:flex-row sm:gap-2">
            <details className="group relative" onKeyDown={closeGramsEditorOnEscape}>
              <summary
                aria-disabled={!isOnline || undefined}
                aria-label={
                  isOnline
                    ? `Edit ${log.name}`
                    : `Edit ${log.name}. ${offlineMutationMessage}`
                }
                className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-primary/40 hover:text-foreground aria-disabled:cursor-not-allowed aria-disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-11 sm:w-11"
                onClick={(event) => {
                  if (!isOnline) {
                    event.preventDefault();
                  }
                }}
                title={!isOnline ? offlineMutationMessage : undefined}
              >
                <Pencil aria-hidden="true" className="h-4 w-4" />
              </summary>
              <form
                action={updateAction}
                className="absolute right-0 top-11 z-10 grid w-56 max-w-[calc(100vw-2rem)] gap-2.5 rounded-md border border-border bg-card p-3 text-sm shadow-soft sm:top-12"
                onSubmit={(event) => {
                  if (!isOnline) {
                    event.preventDefault();
                  }
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <label className="font-semibold" htmlFor={gramsInputId}>
                    Grams
                  </label>
                  <button
                    aria-label="Close grams editor"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={closeGramsEditor}
                    type="button"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
                <input
                  className="min-h-10 w-full min-w-0 rounded-md border border-border bg-background px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                  defaultValue={String(log.grams)}
                  id={gramsInputId}
                  inputMode="decimal"
                  name="grams"
                  type="text"
                />
                <OfflineMutationNotice />
                <button
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 font-semibold text-primary-foreground transition hover:bg-[#49C995] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={!isOnline}
                  title={!isOnline ? offlineMutationMessage : undefined}
                  type="submit"
                >
                  <Save aria-hidden="true" className="h-4 w-4" />
                  Save
                </button>
              </form>
            </details>
            <form
              action={deleteAction}
              onSubmit={(event) => {
                if (!isOnline) {
                  event.preventDefault();
                }
              }}
            >
              <button
                aria-label={
                  isOnline
                    ? `Delete ${log.name}`
                    : `Delete ${log.name}. ${offlineMutationMessage}`
                }
                className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-coral hover:text-coral disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/35 sm:h-11 sm:w-11"
                disabled={!isOnline}
                title={!isOnline ? offlineMutationMessage : undefined}
                type="submit"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function closeGramsEditor(event: MouseEvent<HTMLButtonElement>) {
  const details = event.currentTarget.closest("details");
  const summary = details?.querySelector("summary");

  closeDetailsAndRestoreFocus(details, summary);
}

function closeGramsEditorOnEscape(event: KeyboardEvent<HTMLDetailsElement>) {
  if (event.key !== "Escape") {
    return;
  }

  const details = event.currentTarget;
  const summary = details.querySelector("summary");

  closeDetailsAndRestoreFocus(details, summary);
}

function closeDetailsAndRestoreFocus(
  details: HTMLDetailsElement | null,
  summary: Element | null | undefined,
) {
  if (details) {
    details.open = false;
  }

  if (summary instanceof HTMLElement) {
    summary.focus();
  }
}

function CompactNutrient({
  label,
  shortLabel,
  value,
}: {
  label: string;
  shortLabel: string;
  value: string;
}) {
  return (
    <div className="grid min-h-8 min-w-0 content-center justify-items-center gap-0 rounded-md border border-border/80 bg-surface-soft px-1 py-0.5 text-center text-muted-foreground sm:inline-flex sm:min-h-0 sm:items-center sm:justify-start sm:gap-1 sm:rounded-full sm:border-0 sm:px-2 sm:py-1 sm:text-left">
      <dt className="font-medium leading-3 sm:leading-4">
        {shortLabel === label ? (
          label
        ) : (
          <>
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </>
        )}
      </dt>
      <dd className="font-semibold leading-3 text-foreground sm:leading-4">{value}</dd>
    </div>
  );
}
