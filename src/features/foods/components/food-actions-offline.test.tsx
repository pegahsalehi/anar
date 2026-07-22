import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnlineStatusProvider } from "@/components/pwa/online-status";
import { DeleteFoodButton } from "@/features/foods/components/delete-food-button";
import { FavoriteFoodButton } from "@/features/foods/components/favorite-food-button";

vi.mock("@/features/foods/actions", () => ({
  softDeleteFoodAction: vi.fn(),
  toggleFavoriteFoodAction: vi.fn(),
}));

describe("Food Library offline actions", () => {
  beforeEach(() => {
    setNavigatorOnline(false);
  });

  it("disables favorite and delete actions while keeping controls visible", () => {
    render(
      <OnlineStatusProvider>
        <FavoriteFoodButton foodId="food-1" isFavorite={false} />
        <DeleteFoodButton foodId="food-1" foodName="Feta cheese Coop" />
      </OnlineStatusProvider>,
    );

    expect(screen.getByRole("button", { name: /Add to favorites/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Delete Feta cheese Coop/ })).toBeDisabled();
  });
});

function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}
