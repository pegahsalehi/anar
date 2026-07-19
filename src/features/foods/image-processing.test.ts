import { describe, expect, it } from "vitest";
import {
  buildCompressedFoodImageName,
  formatFoodImageFileSize,
  getScaledImageDimensions,
  maxFoodImageDimension,
} from "@/features/foods/image-processing";

describe("food image processing helpers", () => {
  it("scales landscape images into the maximum 1600 px box", () => {
    expect(getScaledImageDimensions(3200, 1600, maxFoodImageDimension)).toEqual({
      width: 1600,
      height: 800,
    });
  });

  it("preserves smaller image dimensions", () => {
    expect(getScaledImageDimensions(800, 600, maxFoodImageDimension)).toEqual({
      width: 800,
      height: 600,
    });
  });

  it("formats final image sizes for the preview message", () => {
    expect(formatFoodImageFileSize(1024)).toBe("1 KB");
    expect(formatFoodImageFileSize(1024 * 1024)).toBe("1.0 MB");
  });

  it("renames compressed images with the encoded extension", () => {
    expect(buildCompressedFoodImageName("large.photo.png", "webp")).toBe(
      "large.photo.webp",
    );
    expect(buildCompressedFoodImageName("   ", "jpg")).toBe("food-image.jpg");
  });
});
