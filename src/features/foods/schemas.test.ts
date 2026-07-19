import { describe, expect, it } from "vitest";
import { foodFormSchema, validateOptionalFoodImage } from "@/features/foods/schemas";
import { maxFoodImageSizeBytes } from "@/lib/storage/food-images";
import { validFoodNumberMessage } from "@/features/foods/validation";

describe("food form schema", () => {
  it("parses numeric strings and checkbox values", () => {
    const parsed = foodFormSchema.parse({
      name: "Walnuts",
      caloriesPer100g: "654",
      proteinPer100g: "15.2",
      carbohydratesPer100g: "13.7",
      fatPer100g: "65.2",
      notes: "Shelf stable",
      isFavorite: "on",
      imageAction: "keep",
    });

    expect(parsed).toMatchObject({
      name: "Walnuts",
      caloriesPer100g: 654,
      proteinPer100g: 15.2,
      carbohydratesPer100g: 13.7,
      fatPer100g: 65.2,
      notes: "Shelf stable",
      isFavorite: true,
      imageAction: "keep",
    });
  });

  it("rejects missing names and negative nutrition values", () => {
    const parsed = foodFormSchema.safeParse({
      name: "",
      caloriesPer100g: "-1",
      proteinPer100g: "0",
      carbohydratesPer100g: "0",
      fatPer100g: "-0.1",
      isFavorite: "false",
      imageAction: "keep",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(["name", "caloriesPer100g", "fatPer100g"]),
    );
  });

  it("rejects invalid nutrition number input with field-level messages", () => {
    const parsed = foodFormSchema.safeParse({
      name: "Rice",
      caloriesPer100g: "NaN",
      proteinPer100g: "Infinity",
      carbohydratesPer100g: "12abc",
      fatPer100g: "$10",
      isFavorite: "false",
      imageAction: "keep",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["caloriesPer100g"],
          message: validFoodNumberMessage,
        }),
        expect.objectContaining({
          path: ["proteinPer100g"],
          message: validFoodNumberMessage,
        }),
        expect.objectContaining({
          path: ["carbohydratesPer100g"],
          message: validFoodNumberMessage,
        }),
        expect.objectContaining({
          path: ["fatPer100g"],
          message: validFoodNumberMessage,
        }),
      ]),
    );
  });
});

describe("food image validation", () => {
  it("treats a null image value as no upload", () => {
    expect(validateOptionalFoodImage(null)).toEqual({ ok: true, file: null });
  });

  it("treats an empty image upload as no upload", () => {
    expect(validateOptionalFoodImage(createFormDataFile({ size: 0 }))).toEqual({
      ok: true,
      file: null,
    });
  });

  it("accepts a valid JPEG image", () => {
    const file = createFormDataFile({ name: "food.jpg", type: "image/jpeg" });

    expect(validateOptionalFoodImage(file)).toEqual({ ok: true, file });
  });

  it("accepts a valid PNG image", () => {
    const file = createFormDataFile({ name: "food.png", type: "image/png" });

    expect(validateOptionalFoodImage(file)).toEqual({ ok: true, file });
  });

  it("accepts a valid WebP image", () => {
    const file = createFormDataFile({ name: "food.webp", type: "image/webp" });

    expect(validateOptionalFoodImage(file)).toEqual({ ok: true, file });
  });

  it("rejects unsupported image MIME types", () => {
    const file = createFormDataFile({ name: "food.gif", type: "image/gif" });

    expect(validateOptionalFoodImage(file)).toEqual({
      ok: false,
      error: "Use a JPEG, PNG, or WebP image.",
    });
  });

  it("rejects images larger than 1 MB", () => {
    const file = createFormDataFile({
      name: "large.png",
      type: "image/png",
      size: maxFoodImageSizeBytes + 1,
    });

    expect(validateOptionalFoodImage(file)).toEqual({
      ok: false,
      error: "Images must be 1 MB or smaller.",
    });
  });
});

function createFormDataFile({
  name = "food.jpg",
  type = "image/jpeg",
  size = 1024,
}: {
  name?: string;
  type?: string;
  size?: number;
}) {
  return {
    name,
    type,
    size,
    arrayBuffer: async () => new ArrayBuffer(size),
  } as unknown as FormDataEntryValue;
}
