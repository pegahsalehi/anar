import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnlineStatusProvider } from "@/components/pwa/online-status";
import { FoodCard } from "@/components/foods/food-card";
import type { FoodListItem } from "@/features/foods/types";
import { DEFAULT_FOOD_IMAGE_SRC } from "@/lib/food-image";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/features/foods/components/favorite-food-button", () => ({
  FavoriteFoodButton: ({ isFavorite }: { foodId: string; isFavorite: boolean }) => (
    <button type="button">{isFavorite ? "Remove from favorites" : "Add to favorites"}</button>
  ),
}));

vi.mock("@/features/foods/components/delete-food-button", () => ({
  DeleteFoodButton: ({ foodName }: { foodId: string; foodName: string }) => (
    <button type="button">{`Delete ${foodName}`}</button>
  ),
}));

describe("FoodCard", () => {
  beforeEach(() => {
    setNavigatorOnline(true);
  });

  it("presents a reusable library item with per-100-g nutrition and management actions", () => {
    const { container } = render(<FoodCard food={food()} />);

    expect(screen.getByRole("heading", { name: "Feta cheese Coop" })).toBeInTheDocument();
    expect(screen.getByText("Per 100 g")).toBeInTheDocument();
    expect(screen.getByText("260 cal")).toBeInTheDocument();
    expect(screen.getByText("14 g")).toBeInTheDocument();
    expect(screen.getByText("2 g")).toBeInTheDocument();
    expect(screen.getByText("21 g")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to favorites" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit Feta cheese Coop" })).toHaveAttribute(
      "href",
      "/foods/food-1/edit",
    );
    expect(screen.getByRole("button", { name: "Delete Feta cheese Coop" })).toBeInTheDocument();
    expect(screen.getByAltText("Feta cheese Coop image")).toHaveAttribute(
      "src",
      DEFAULT_FOOD_IMAGE_SRC,
    );

    const card = container.querySelector("article");
    expect(card).toHaveClass("border", "border-border/80", "bg-card");
    expect(card).not.toHaveClass("border-2");
    expect(container.innerHTML).not.toContain("repeating-linear-gradient");
  });

  it("keeps the mobile image compact while preserving the desktop image size", () => {
    const { container } = render(<FoodCard food={food()} />);

    const imageFrame = container.querySelector(".h-12.w-12.sm\\:h-16.sm\\:w-16");
    expect(imageFrame).toBeInTheDocument();
  });

  it("keeps all four nutrition values in one compact mobile row", () => {
    const { container } = render(<FoodCard food={food()} />);

    const nutritionGrid = container.querySelector("dl");
    expect(nutritionGrid).toHaveClass("grid-cols-4");
    expect(nutritionGrid).not.toHaveClass("grid-cols-2");
    expect(screen.getByText("Cal")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Carb")).toBeInTheDocument();
    expect(screen.getByText("Fat")).toBeInTheDocument();
  });

  it("renders an uploaded image instead of the fallback when one exists", () => {
    render(<FoodCard food={food({ imageUrl: "/signed/feta.webp" })} />);

    expect(screen.getByAltText("Feta cheese Coop image")).toHaveAttribute(
      "src",
      "/signed/feta.webp",
    );
  });

  it("keeps food data visible while disabling the edit link offline", () => {
    setNavigatorOnline(false);

    render(
      <OnlineStatusProvider>
        <FoodCard food={food()} />
      </OnlineStatusProvider>,
    );

    expect(screen.getByRole("heading", { name: "Feta cheese Coop" })).toBeInTheDocument();
    expect(screen.getByText("260 cal")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit Feta cheese Coop" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});

function food(overrides: Partial<FoodListItem> = {}): FoodListItem {
  return {
    id: "food-1",
    user_id: "user-1",
    name: "Feta cheese Coop",
    image_path: null,
    imageUrl: null,
    calories_per_100g: 260,
    protein_per_100g: 14,
    carbohydrates_per_100g: 2,
    fat_per_100g: 21,
    notes: null,
    is_favorite: false,
    deleted_at: null,
    created_at: "2026-07-22T08:00:00.000Z",
    updated_at: "2026-07-22T08:00:00.000Z",
    ...overrides,
  };
}

function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}
