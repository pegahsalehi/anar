import { describe, expect, it } from "vitest";
import { buildFoodLogInsertPayload } from "@/features/today/logging";

describe("buildFoodLogInsertPayload", () => {
  it("builds owner-scoped food log snapshots from the server-loaded food row", () => {
    const payload = buildFoodLogInsertPayload({
      userId: "user-123",
      consumedGrams: 75,
      loggedAt: "2026-07-18T10:00:00.000Z",
      localLogDate: "2026-07-18",
      food: {
        id: "food-123",
        name: "Greek yogurt",
        image_path: "user-123/image.webp",
        calories_per_100g: 97,
        protein_per_100g: 9,
        carbohydrates_per_100g: 3.9,
      },
    });

    expect(payload).toEqual({
      user_id: "user-123",
      food_id: "food-123",
      consumed_grams: 75,
      logged_at: "2026-07-18T10:00:00.000Z",
      local_log_date: "2026-07-18",
      food_name_snapshot: "Greek yogurt",
      image_path_snapshot: "user-123/image.webp",
      calories_per_100g_snapshot: 97,
      protein_per_100g_snapshot: 9,
      carbohydrates_per_100g_snapshot: 3.9,
    });
  });
});
