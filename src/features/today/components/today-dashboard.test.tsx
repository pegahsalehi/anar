import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnlineStatusProvider } from "@/components/pwa/online-status";
import { TodayDashboard } from "@/features/today/components/today-dashboard";
import type { TodayDashboardData, TodayFoodOption } from "@/features/today/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/features/today/actions", () => ({
  addFoodLogAction: vi.fn(),
  deleteFoodLogAction: vi.fn(),
  updateFoodLogGramsAction: vi.fn(),
}));

vi.mock("@/components/nutrition/daily-summary", () => ({
  DailySummary: () => <div data-testid="daily-summary" />,
}));

vi.mock("@/components/nutrition/streak-card", () => ({
  StreakCard: () => <div data-testid="streak-card" />,
}));

describe("TodayDashboard mobile layout", () => {
  beforeEach(() => {
    setNavigatorOnline(true);
  });

  it("uses compact mobile header typography while preserving desktop classes", () => {
    const { container } = render(<TodayDashboard data={dashboardData()} />);

    expect(container.querySelector("h1")).toHaveClass("text-[1.5rem]", "sm:text-3xl");
    expect(screen.getByText(/Log what you eat/)).toHaveClass("text-[0.8rem]", "sm:text-sm");
  });

  it("uses a two-column mobile quick access grid with compact cards", () => {
    const { container } = render(<TodayDashboard data={dashboardData()} />);

    const quickGrid = container.querySelector(".grid.grid-cols-2.gap-2.sm\\:gap-3.xl\\:grid-cols-4");
    expect(quickGrid).toBeInTheDocument();
    expect(quickGrid).not.toHaveClass("grid-cols-1");
    expect(container.querySelector(".line-clamp-2")).toBeInTheDocument();
    expect(screen.getByText("260 cal per 100 g")).toBeInTheDocument();
  });

  it("uses compact horizontal mobile empty states without changing desktop classes", () => {
    const { container } = render(
      <TodayDashboard data={{ ...dashboardData(), foods: [], logs: [], quickFoods: [] }} />,
    );

    expect(screen.getByText("Nothing logged yet")).toBeInTheDocument();
    expect(screen.getByText("Your library is empty")).toBeInTheDocument();

    const emptyStates = Array.from(
      container.querySelectorAll<HTMLElement>('[data-mobile-compact="true"]'),
    );

    expect(emptyStates).toHaveLength(2);
    emptyStates.forEach((emptyState) => {
      expect(emptyState.firstElementChild).toHaveClass(
        "grid-cols-[4.75rem_minmax(0,1fr)]",
        "sm:grid-cols-[13rem_1fr]",
      );
    });
    expect(container.querySelectorAll(".h-\\[4\\.75rem\\].w-\\[4\\.75rem\\]")).toHaveLength(2);
    expect(within(emptyStates[0]).getByRole("button", { name: "Add food" })).toHaveClass(
      "min-h-11",
      "sm:min-h-12",
    );
    expect(within(emptyStates[1]).getByRole("link", { name: "Create food" })).toHaveClass(
      "min-h-11",
      "sm:min-h-12",
    );
  });

  it("keeps rendered data visible while disabling Today mutations offline", async () => {
    const user = userEvent.setup();

    setNavigatorOnline(false);

    render(
      <OnlineStatusProvider>
        <TodayDashboard data={dashboardData()} />
      </OnlineStatusProvider>,
    );

    expect(screen.getByRole("heading", { name: "Feta cheese Coop" })).toBeInTheDocument();
    expect(screen.getByText("31 cal")).toBeInTheDocument();
    screen.getAllByRole("button", { name: "Add food" }).forEach((button) => {
      expect(button).toBeDisabled();
    });
    expect(screen.getByRole("button", { name: /260 cal per 100 g/ })).toBeDisabled();
    expect(screen.getByLabelText(/Edit Feta cheese Coop/)).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: /Delete Feta cheese Coop/ })).toBeDisabled();

    await user.click(screen.getAllByRole("button", { name: "Add food" })[0]);

    expect(screen.queryByRole("dialog", { name: "Log food" })).not.toBeInTheDocument();
  });
});

function dashboardData(): TodayDashboardData {
  return {
    localDate: "2026-07-22",
    displayDate: "Wednesday, July 22, 2026",
    timezone: "Europe/Oslo",
    goals: {
      caloriesTarget: 2000,
      proteinTarget: 120,
      carbohydratesTarget: 220,
      fatTarget: 70,
    },
    totals: {
      calories: 31,
      protein: 2.5,
      carbohydrates: 0.1,
      fat: 1.9,
    },
    progress: {
      calories: progress(),
      protein: progress(),
      carbohydrates: progress(),
      fat: progress(),
    },
    foods: foods(),
    quickFoods: foods(),
    logs: [
      {
        id: "log-1",
        foodId: "food-1",
        name: "Feta cheese Coop",
        grams: 11,
        calories: 31,
        protein: 2.5,
        carbohydrates: 0.1,
        fat: 1.9,
        loggedAt: "2026-07-22T08:34:00.000Z",
        time: "10:34 AM",
        imageUrl: null,
      },
    ],
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      activeDays: 0,
      weekDays: [],
    },
    error: null,
  };
}

function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}

function progress() {
  return {
    consumed: 0,
    target: 100,
    remaining: 100,
    exceeded: 0,
    ratio: 0,
    clampedRatio: 0,
  };
}

function foods(): TodayFoodOption[] {
  return [
    {
      id: "food-1",
      name: "Feta cheese Coop",
      imageUrl: null,
      is_favorite: true,
      calories_per_100g: 260,
      protein_per_100g: 14,
      carbohydrates_per_100g: 2,
      fat_per_100g: 21,
    },
    {
      id: "food-2",
      name: "Greek yogurt with a longer saved food name",
      imageUrl: null,
      is_favorite: false,
      calories_per_100g: 120,
      protein_per_100g: 10,
      carbohydrates_per_100g: 3,
      fat_per_100g: 4,
    },
  ];
}
