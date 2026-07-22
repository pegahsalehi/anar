import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnlineStatusProvider } from "@/components/pwa/online-status";
import { FoodLogItem, type FoodLogListItem } from "@/components/nutrition/food-log-item";

vi.mock("@/features/today/actions", () => ({
  deleteFoodLogAction: vi.fn(),
  updateFoodLogGramsAction: vi.fn(),
}));

describe("FoodLogItem", () => {
  beforeEach(() => {
    setNavigatorOnline(true);
  });

  it("presents a consumed activity log row with grams, time, and compact nutrition", () => {
    const { container } = render(<FoodLogItem log={log()} />);
    const row = container.querySelector("article");

    expect(row).toHaveClass("border-l-[3px]");
    expect(row).not.toHaveClass("shadow-sm");
    expect(screen.getByRole("heading", { name: "Feta cheese Coop" })).toBeInTheDocument();
    expect(screen.getByText("Logged")).toBeInTheDocument();
    expect(screen.getByText(/11 g/)).toBeInTheDocument();
    expect(screen.getByText(/10:34 AM/)).toBeInTheDocument();
    expect(screen.getByText("31 cal")).toBeInTheDocument();
    expect(screen.getByText("Protein")).toBeInTheDocument();
    expect(screen.getByText("2.5 g")).toBeInTheDocument();
    expect(screen.getByText("Carbs")).toBeInTheDocument();
    expect(screen.getByText("0.1 g")).toBeInTheDocument();
    expect(screen.getByText("Fat")).toBeInTheDocument();
    expect(screen.getByText("1.9 g")).toBeInTheDocument();
  });

  it("keeps edit and delete log actions available without showing a favorite control", () => {
    render(<FoodLogItem log={log()} />);

    expect(screen.getByLabelText("Edit Feta cheese Coop")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete Feta cheese Coop" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /favorite/i })).not.toBeInTheDocument();
  });

  it("closes the grams editor with a visible close button and restores focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<FoodLogItem log={log()} />);
    const editButton = screen.getByLabelText("Edit Feta cheese Coop");
    const editor = container.querySelector("details");

    await user.click(editButton);

    expect(editor).toHaveAttribute("open");
    expect(screen.getByLabelText("Close grams editor")).toBeInTheDocument();
    expect(screen.getByLabelText("Grams")).toHaveValue("11");

    await user.click(screen.getByLabelText("Close grams editor"));

    expect(editor).not.toHaveAttribute("open");
    expect(editButton).toHaveFocus();
  });

  it("uses wrapping and min-width safeguards for mobile log rows", () => {
    const { container } = render(<FoodLogItem log={log()} />);
    const nutritionList = container.querySelector("dl");

    expect(nutritionList).toHaveClass("grid-cols-4");
    expect(nutritionList).toHaveClass("min-w-0");
    expect(nutritionList).toHaveClass("sm:flex-wrap");
    expect(container.querySelector(".flex-col.sm\\:flex-row")).toBeInTheDocument();
    expect(screen.getByText("Cal")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Carb")).toBeInTheDocument();
  });

  it("keeps log data visible but disables edit and delete controls offline", () => {
    setNavigatorOnline(false);

    render(
      <OnlineStatusProvider>
        <FoodLogItem log={log()} />
      </OnlineStatusProvider>,
    );

    expect(screen.getByRole("heading", { name: "Feta cheese Coop" })).toBeInTheDocument();
    expect(screen.getByText("31 cal")).toBeInTheDocument();
    expect(screen.getByLabelText(/Edit Feta cheese Coop/)).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: /Delete Feta cheese Coop/ })).toBeDisabled();
  });
});

function log(): FoodLogListItem {
  return {
    id: "log-1",
    name: "Feta cheese Coop",
    grams: 11,
    calories: 31,
    protein: 2.5,
    carbohydrates: 0.1,
    fat: 1.9,
    time: "10:34 AM",
    imageUrl: null,
  };
}

function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}
