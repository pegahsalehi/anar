"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, Plus, Utensils, X } from "lucide-react";
import { FoodImage } from "@/components/foods/food-image";
import { PageHeader } from "@/components/layout/page-header";
import { DailySummary } from "@/components/nutrition/daily-summary";
import { FoodLogItem } from "@/components/nutrition/food-log-item";
import {
  OfflineMutationNotice,
  OnlineOnlyLink,
  offlineMutationMessage,
  useOnlineStatus,
} from "@/components/pwa/online-status";
import { StreakCard } from "@/components/nutrition/streak-card";
import { IllustratedEmptyState } from "@/components/ui/illustrated-empty-state";
import { addFoodLogAction } from "@/features/today/actions";
import {
  initialLogFoodMutationState,
  type TodayDashboardData,
  type TodayFoodOption,
} from "@/features/today/types";
import { formatCalories, formatDecimal } from "@/lib/format";
import { cn } from "@/lib/utils";

type TodayDashboardProps = {
  data: TodayDashboardData;
};

export function TodayDashboard({ data }: TodayDashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const { isOnline } = useOnlineStatus();

  function openLogDialog(foodId?: string) {
    if (!isOnline) {
      return;
    }

    setSelectedFoodId(foodId ?? data.foods[0]?.id ?? null);
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-5 sm:space-y-7">
      <PageHeader
        compactMobile
        eyebrow={data.displayDate}
        eyebrowClassName="text-[#45B385]"
        title="Today’s plate, your progress."
        description="Log what you eat, see what’s adding up, and keep your rhythm going."
        action={
          <AddFoodButton onClick={() => openLogDialog()} />
        }
      />

      {data.error ? (
        <p className="rounded-md border border-coral/25 bg-coral/10 px-4 py-3 text-sm text-coral" role="alert">
          {data.error}
        </p>
      ) : null}

      <div className="space-y-4 sm:space-y-5">
        <StreakCard {...data.streak} />
        <section aria-labelledby="today-nutrition-title" className="space-y-2.5 pt-1 sm:space-y-3 sm:pt-2">
          <SectionHeading id="today-nutrition-title">Today&rsquo;s nutrition</SectionHeading>
          <DailySummary progress={data.progress} />
        </section>
      </div>

      <section className="space-y-2.5 pt-1 sm:space-y-3 sm:pt-2">
        <div className="flex items-center justify-between gap-4">
          <SectionHeading>Today&rsquo;s foods</SectionHeading>
          <span className="text-sm text-muted-foreground">
            {data.logs.length} {data.logs.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        {data.logs.length > 0 ? (
          <>
            <div className="grid gap-2.5 sm:gap-3">
              {data.logs.map((log) => (
                <FoodLogItem key={log.id} log={log} />
              ))}
            </div>
            <div className="flex justify-end">
              <AddFoodButton className="w-full sm:w-auto" onClick={() => openLogDialog()} />
            </div>
          </>
        ) : (
          <IllustratedEmptyState
            mobileCompact
            action={
              <AddFoodButton onClick={() => openLogDialog()} />
            }
            title="Nothing logged yet"
            description="Add the first food for today and your totals will update here."
            illustrationSrc="/images/empty-states/healthy-food-bowl.png"
          />
        )}
      </section>

      <section className="space-y-2.5 pt-1 sm:space-y-3 sm:pt-2">
        <div className="flex items-center justify-between gap-4">
          <SectionHeading>Quick access</SectionHeading>
          <Link className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" href="/foods">
            Manage library
          </Link>
        </div>
        {data.quickFoods.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
            {data.quickFoods.map((food) => (
              <button
                aria-disabled={!isOnline || undefined}
                className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-card p-2 text-left text-xs shadow-sm transition hover:border-primary/70 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-20 sm:gap-3 sm:p-3 sm:text-sm"
                disabled={!isOnline}
                key={food.id}
                onClick={() => openLogDialog(food.id)}
                title={!isOnline ? offlineMutationMessage : undefined}
                type="button"
              >
                <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md sm:h-12 sm:w-12">
                  <FoodImage alt={`${food.name} image`} src={food.imageUrl} />
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 font-medium leading-4 text-card-foreground sm:block sm:truncate sm:leading-5">
                    {food.name}
                  </span>
                  <span className="mt-0.5 block text-[0.68rem] leading-4 text-muted-foreground sm:mt-1 sm:text-xs">
                    {formatCalories(food.calories_per_100g)} per 100 g
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <IllustratedEmptyState
            mobileCompact
            action={
              <OnlineOnlyLink
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#49C995] active:bg-[#38B982] sm:min-h-12 sm:gap-2 sm:px-5 sm:py-3 sm:text-base"
                href="/foods/new"
              >
                <ImagePlus aria-hidden="true" className="h-5 w-5" />
                Create food
              </OnlineOnlyLink>
            }
            title="Your library is empty"
            description="Create reusable foods first, then log them here by grams."
            illustrationSrc="/images/empty-states/nutrition-book.png"
          />
        )}
      </section>

      <LogFoodDialog
        foods={data.foods}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedFoodId={selectedFoodId}
      />
    </div>
  );
}

function SectionHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2
      className="flex items-center gap-2 text-base font-semibold leading-tight text-foreground sm:text-lg"
      id={id}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </h2>
  );
}

function AddFoodButton({
  className,
  onClick,
}: {
  className?: string;
  onClick: () => void;
}) {
  const { isOnline } = useOnlineStatus();

  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#49C995] active:bg-[#38B982] disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-12 sm:gap-2 sm:px-5 sm:py-3",
        className,
      )}
      disabled={!isOnline}
      onClick={onClick}
      title={!isOnline ? offlineMutationMessage : undefined}
      type="button"
    >
      <Plus aria-hidden="true" className="h-5 w-5" />
      Add food
    </button>
  );
}

type LogFoodDialogProps = {
  foods: TodayFoodOption[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFoodId: string | null;
};

function LogFoodDialog({
  foods,
  isOpen,
  onOpenChange,
  selectedFoodId,
}: LogFoodDialogProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(addFoodLogAction, initialLogFoodMutationState);
  const [foodId, setFoodId] = useState("");
  const [gramsInput, setGramsInput] = useState("100");
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    if (isOpen) {
      setFoodId(selectedFoodId ?? foods[0]?.id ?? "");
      setGramsInput("100");
    }
  }, [foods, isOpen, selectedFoodId]);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      onOpenChange(false);
    }
  }, [onOpenChange, router, state.status]);

  const selectedFood = useMemo(
    () => foods.find((food) => food.id === foodId) ?? null,
    [foodId, foods],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="log-food-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 backdrop-blur-sm"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onOpenChange(false);
        }
      }}
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-md border border-border bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground" id="log-food-dialog-title">
              Log food
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Select a saved food and enter how many grams you consumed.
            </p>
          </div>
          <button
            aria-label="Close dialog"
            className="flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        {foods.length === 0 ? (
          <div className="mt-5 rounded-md border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">
            No foods are available yet. Create a food before logging today&apos;s intake.
          </div>
        ) : (
          <form
            action={formAction}
            className="mt-5 grid gap-3.5"
            onSubmit={(event) => {
              if (!isOnline) {
                event.preventDefault();
              }
            }}
          >
            {state.message && state.status === "error" ? (
              <p className="rounded-md bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
                {state.message}
              </p>
            ) : null}
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">Food</span>
              <select
                aria-invalid={Boolean(state.fieldErrors.foodId)}
                className="min-h-12 rounded-md border border-[#DDE4E0] bg-[#F7F8F6] px-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                name="foodId"
                onChange={(event) => setFoodId(event.target.value)}
                value={foodId}
              >
                {foods.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name}
                  </option>
                ))}
              </select>
              {state.fieldErrors.foodId ? (
                <span className="text-sm text-coral" role="alert">
                  {state.fieldErrors.foodId}
                </span>
              ) : null}
            </label>

            {selectedFood ? (
              <div className="flex items-start gap-3 rounded-md border border-[#DDE4E0] bg-[#F7F8F6] p-3">
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-md">
                  <FoodImage alt={`${selectedFood.name} image`} src={selectedFood.imageUrl} />
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium text-card-foreground">{selectedFood.name}</p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">Per 100 g</p>
                  <dl className="mt-2 flex flex-wrap gap-1.5">
                    <CompactNutrition
                      label="Calories"
                      value={formatCalories(selectedFood.calories_per_100g)}
                    />
                    <CompactNutrition
                      label="Protein"
                      value={`${formatDecimal(selectedFood.protein_per_100g)} g`}
                    />
                    <CompactNutrition
                      label="Carbs"
                      value={`${formatDecimal(selectedFood.carbohydrates_per_100g)} g`}
                    />
                    <CompactNutrition
                      label="Fat"
                      value={`${formatDecimal(selectedFood.fat_per_100g)} g`}
                    />
                  </dl>
                </div>
              </div>
            ) : null}

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">Consumed grams</span>
              <span className="flex min-h-12 items-center rounded-md border border-[#DDE4E0] bg-[#F7F8F6] px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                <input
                  aria-invalid={Boolean(state.fieldErrors.grams)}
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                  inputMode="decimal"
                  name="grams"
                  onChange={(event) => setGramsInput(event.currentTarget.value)}
                  placeholder="100"
                  type="text"
                  value={gramsInput}
                />
                <span className="shrink-0 text-sm font-semibold text-muted-foreground">g</span>
              </span>
              {state.fieldErrors.grams ? (
                <span className="text-sm text-coral" role="alert">
                  {state.fieldErrors.grams}
                </span>
              ) : null}
            </label>

            <OfflineMutationNotice />
            <LogFoodSubmitButton />
          </form>
        )}

        {foods.length === 0 ? (
          <OnlineOnlyLink
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#49C995]"
            href="/foods/new"
          >
            <Utensils aria-hidden="true" className="h-5 w-5" />
            Create food
          </OnlineOnlyLink>
        ) : null}
      </div>
    </div>
  );
}

function CompactNutrition({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-card px-2 py-1 text-[0.68rem] leading-4">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function LogFoodSubmitButton() {
  const { pending } = useFormStatus();
  const { isOnline } = useOnlineStatus();

  return (
    <button
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#49C995] active:bg-[#38B982] disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending || !isOnline}
      title={!isOnline ? offlineMutationMessage : undefined}
      type="submit"
    >
      <Plus aria-hidden="true" className="h-5 w-5" />
      {pending ? "Logging..." : "Log food"}
    </button>
  );
}
