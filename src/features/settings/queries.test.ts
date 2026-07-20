import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_DAILY_NUTRITION_TARGETS } from "@/lib/nutrition";

const { createServerSupabaseClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

describe("getSettingsPageData", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-20T12:00:00.000Z"));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns shared defaults for a new user with no saved nutrition targets", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      createSettingsPageSupabaseMock({
        goalResult: { data: null, error: null },
      }),
    );

    const data = await getSettingsPageData();

    expect(data).toEqual({
      dailyGoals: DEFAULT_DAILY_NUTRITION_TARGETS,
      effectiveDate: "2026-07-20",
      error: null,
    });
  });

  it("keeps an existing user's saved nutrition targets", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      createSettingsPageSupabaseMock({
        goalResult: {
          data: {
            calories_target: 1650,
            protein_target: 110,
            carbohydrates_target: 210,
            fat_target: 55,
          },
          error: null,
        },
      }),
    );

    const data = await getSettingsPageData();

    expect(data.dailyGoals).toEqual({
      caloriesTarget: 1650,
      proteinTarget: 110,
      carbohydratesTarget: 210,
      fatTarget: 55,
    });
  });

  it("falls back safely for partial saved nutrition target data", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      createSettingsPageSupabaseMock({
        goalResult: {
          data: {
            calories_target: 1800,
            protein_target: null,
            fat_target: 0,
          },
          error: null,
        },
      }),
    );

    const data = await getSettingsPageData();

    expect(data.dailyGoals).toEqual({
      caloriesTarget: 1800,
      proteinTarget: 50,
      carbohydratesTarget: 275,
      fatTarget: 0,
    });
  });
});

async function getSettingsPageData() {
  const settingsQueries = await import("@/features/settings/queries");

  return settingsQueries.getSettingsPageData();
}

function createSettingsPageSupabaseMock({
  goalResult,
}: {
  goalResult: {
    data: unknown;
    error: unknown;
  };
}) {
  const queryBuilder = {
    eq: vi.fn(() => queryBuilder),
    limit: vi.fn(() => queryBuilder),
    lte: vi.fn(() => queryBuilder),
    maybeSingle: vi
      .fn()
      .mockResolvedValueOnce({ data: { timezone: "UTC" }, error: null })
      .mockResolvedValueOnce(goalResult),
    order: vi.fn(() => queryBuilder),
    select: vi.fn(() => queryBuilder),
  };

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      if (table !== "profiles" && table !== "daily_goals") {
        throw new Error(`Unexpected table ${table}`);
      }

      return queryBuilder;
    }),
  };
}
