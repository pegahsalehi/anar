import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildFoodImagePath,
  createSignedImageUrlMap,
  foodImagesBucket,
  maxFoodImageSizeBytes,
  removeFoodImage,
  validateFoodImage,
  type FoodImageFile,
} from "@/lib/storage/food-images";
import { DEFAULT_FOOD_IMAGE_SRC } from "@/lib/food-image";

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
      error: "Images must be 1 MB or smaller.",
    });
  });

  it("does not pass the public fallback image to signed URL creation", async () => {
    const createSignedUrls = vi.fn().mockResolvedValue({
      data: [{ path: "user-123/food.webp", signedUrl: "/signed/food.webp" }],
      error: null,
    });
    const from = vi.fn(() => ({ createSignedUrls }));
    const supabase = {
      storage: { from },
    };

    const result = await createSignedImageUrlMap(supabase as never, [
      DEFAULT_FOOD_IMAGE_SRC,
      "user-123/food.webp",
      null,
    ]);

    expect(from).toHaveBeenCalledWith(foodImagesBucket);
    expect(createSignedUrls).toHaveBeenCalledWith(["user-123/food.webp"], 60 * 60);
    expect(result.get("user-123/food.webp")).toBe("/signed/food.webp");
    expect(result.has(DEFAULT_FOOD_IMAGE_SRC)).toBe(false);
  });

  it("does not remove the public fallback image from storage", async () => {
    const remove = vi.fn();
    const from = vi.fn(() => ({ remove }));
    const supabase = {
      storage: { from },
    };

    await removeFoodImage(supabase as never, DEFAULT_FOOD_IMAGE_SRC);

    expect(from).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
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
