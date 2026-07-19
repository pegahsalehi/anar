import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildFoodImagePath,
  maxFoodImageSizeBytes,
  validateFoodImage,
  type FoodImageFile,
} from "@/lib/storage/food-images";

describe("food image storage helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stores images under the authenticated user's folder", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "00000000-0000-4000-8000-000000000000",
    );

    expect(buildFoodImagePath("user-123", "image/png")).toBe(
      "user-123/00000000-0000-4000-8000-000000000000.png",
    );
  });

  it("validates allowed type and size", () => {
    const file = createImageFile({ name: "food.jpg", type: "image/jpeg" });

    expect(validateFoodImage(file)).toEqual({ ok: true, file });
  });

  it("rejects oversized files", () => {
    const file = createImageFile({
      name: "food.png",
      type: "image/png",
      size: maxFoodImageSizeBytes + 1,
    });

    expect(validateFoodImage(file)).toEqual({
      ok: false,
      error: "Images must be 2 MB or smaller.",
    });
  });
});

function createImageFile({
  name,
  type,
  size = 1024,
}: {
  name: string;
  type: string;
  size?: number;
}) {
  return {
    name,
    type,
    size,
    arrayBuffer: async () => new ArrayBuffer(size),
  } as unknown as FoodImageFile;
}
