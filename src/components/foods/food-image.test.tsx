import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FoodImage } from "@/components/foods/food-image";
import { DEFAULT_FOOD_IMAGE_SRC } from "@/lib/food-image";

describe("FoodImage", () => {
  it("renders the shared fallback when a food has no uploaded image", () => {
    render(<FoodImage alt="Feta cheese image" src={null} />);

    expect(screen.getByAltText("Feta cheese image")).toHaveAttribute(
      "src",
      DEFAULT_FOOD_IMAGE_SRC,
    );
  });

  it("renders the uploaded image when one is available", () => {
    render(<FoodImage alt="Feta cheese image" src="/signed/feta.webp" />);

    expect(screen.getByAltText("Feta cheese image")).toHaveAttribute("src", "/signed/feta.webp");
  });
});
