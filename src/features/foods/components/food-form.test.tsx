import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnlineStatusProvider } from "@/components/pwa/online-status";
import { FoodForm } from "@/features/foods/components/food-form";
import { prepareFoodImageForUpload } from "@/features/foods/image-processing";
import type { FoodRow } from "@/features/foods/types";
import { DEFAULT_FOOD_IMAGE_SRC } from "@/lib/food-image";

vi.mock("@/features/foods/image-processing", () => ({
  formatFoodImageFileSize: (size: number) => `${size} B`,
  prepareFoodImageForUpload: vi.fn(),
}));

const prepareFoodImageForUploadMock = vi.mocked(prepareFoodImageForUpload);

describe("FoodForm image preview", () => {
  beforeEach(() => {
    setNavigatorOnline(true);
    prepareFoodImageForUploadMock.mockReset();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:food-preview"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("shows the shared fallback image when no image is selected", () => {
    const { container } = render(<FoodForm action={vi.fn()} submitLabel="Save food" />);

    expect(screen.getByAltText("Create food preview")).toHaveAttribute(
      "src",
      DEFAULT_FOOD_IMAGE_SRC,
    );
    expect(screen.getByText("Choose image")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove image" })).not.toBeInTheDocument();

    const formData = new FormData(container.querySelector("form") ?? undefined);
    expect(formData.get("imageAction")).toBe("keep");
    expect(Array.from(formData.values())).not.toContain(DEFAULT_FOOD_IMAGE_SRC);
  });

  it("replaces the fallback with a local preview when an image is selected", async () => {
    const user = userEvent.setup();
    const imageFile = new File(["image"], "walnuts.png", { type: "image/png" });
    prepareFoodImageForUploadMock.mockResolvedValue({
      ok: true,
      file: imageFile,
      wasCompressed: false,
    });
    const { container } = render(<FoodForm action={vi.fn()} submitLabel="Save food" />);
    const upload = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(upload, imageFile);

    await waitFor(() => {
      expect(screen.getByAltText("Create food preview")).toHaveAttribute(
        "src",
        "blob:food-preview",
      );
    });
    expect(new FormData(container.querySelector("form") ?? undefined).get("imageAction")).toBe(
      "replace",
    );
  });

  it("returns to the fallback when an uploaded image is removed", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FoodForm
        action={vi.fn()}
        food={food()}
        imageUrl="/signed/existing-food.webp"
        submitLabel="Save food"
      />,
    );

    expect(screen.getByAltText("Edit food preview")).toHaveAttribute(
      "src",
      "/signed/existing-food.webp",
    );

    await user.click(screen.getByRole("button", { name: "Remove image" }));

    expect(screen.getByAltText("Edit food preview")).toHaveAttribute(
      "src",
      DEFAULT_FOOD_IMAGE_SRC,
    );
    expect(new FormData(container.querySelector("form") ?? undefined).get("imageAction")).toBe(
      "remove",
    );
    expect(Array.from(new FormData(container.querySelector("form") ?? undefined).values())).not.toContain(
      DEFAULT_FOOD_IMAGE_SRC,
    );
  });

  it("keeps form values visible but disables saving while offline", async () => {
    const user = userEvent.setup();
    const action = vi.fn();

    setNavigatorOnline(false);

    render(
      <OnlineStatusProvider>
        <FoodForm action={action} food={food()} submitLabel="Save food" />
      </OnlineStatusProvider>,
    );

    expect(screen.getByDisplayValue("Feta cheese Coop")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save food" })).toBeDisabled();
    expect(screen.getByText("Available when you're back online.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save food" }));

    expect(action).not.toHaveBeenCalled();
  });
});

function food(): FoodRow {
  return {
    id: "food-1",
    user_id: "user-1",
    name: "Feta cheese Coop",
    image_path: "user-1/feta.webp",
    calories_per_100g: 260,
    protein_per_100g: 14,
    carbohydrates_per_100g: 2,
    fat_per_100g: 21,
    notes: null,
    is_favorite: false,
    deleted_at: null,
    created_at: "2026-07-22T08:00:00.000Z",
    updated_at: "2026-07-22T08:00:00.000Z",
  };
}

function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}
