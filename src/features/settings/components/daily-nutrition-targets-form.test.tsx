import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnlineStatusProvider } from "@/components/pwa/online-status";
import { DailyNutritionTargetsForm } from "@/features/settings/components/daily-nutrition-targets-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/features/settings/actions", () => ({
  saveDailyNutritionTargetsAction: vi.fn(),
}));

describe("DailyNutritionTargetsForm", () => {
  beforeEach(() => {
    setNavigatorOnline(true);
  });

  it("renders a compact responsive targets layout without hatched nutrient panels", () => {
    const { container } = render(
      <DailyNutritionTargetsForm
        effectiveDate="2026-07-22"
        initialValues={{
          caloriesTarget: 1600,
          proteinTarget: 105,
          carbohydratesTarget: 205,
          fatTarget: 60,
        }}
      />,
    );

    expect(screen.getByRole("button", { name: /Daily nutrition targets/ })).toBeInTheDocument();
    expect(screen.getByText("Effective 2026-07-22")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save targets" })).toBeInTheDocument();

    const grid = container.querySelector(".grid.grid-cols-2.xl\\:grid-cols-4");
    expect(grid).toBeInTheDocument();
    expect(grid).not.toHaveClass("grid-cols-1");
    expect(container.innerHTML).not.toContain("repeating-linear-gradient");

    for (const fieldName of [
      "caloriesTarget",
      "proteinTarget",
      "carbohydratesTarget",
      "fatTarget",
    ]) {
      expect(container.querySelector(`input[name="${fieldName}"]`)).toBeInTheDocument();
    }
  });

  it("keeps target values visible but disables saving while offline", () => {
    setNavigatorOnline(false);

    render(
      <OnlineStatusProvider>
        <DailyNutritionTargetsForm
          effectiveDate="2026-07-22"
          initialValues={{
            caloriesTarget: 1600,
            proteinTarget: 105,
            carbohydratesTarget: 205,
            fatTarget: 60,
          }}
        />
      </OnlineStatusProvider>,
    );

    expect(screen.getByDisplayValue("1600")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save targets" })).toBeDisabled();
    expect(screen.getByText("Available when you're back online.")).toBeInTheDocument();
  });
});

function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}
