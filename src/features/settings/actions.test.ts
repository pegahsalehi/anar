import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { goalRangeOrderMessage } from "@/features/settings/validation";
import type { DailyGoalRangeActionState } from "@/features/settings/types";

const { createServerSupabaseClientMock, revalidatePathMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

describe("saveDailyGoalRangesAction", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T12:00:00.000Z"));
    vi.clearAllMocks();
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("saves valid ranges for the authenticated user and revalidates dependent pages", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const maybeSingleMock = vi
      .fn()
      .mockResolvedValueOnce({ data: { timezone: "UTC" }, error: null })
      .mockResolvedValueOnce({ data: null, error: null });
    const supabase = createSettingsSupabaseMock({
      insertMock,
      maybeSingleMock,
      user: { id: "user-1" },
    });
    createServerSupabaseClientMock.mockResolvedValue(supabase);

    const result = await save(formDataWithRanges());

    expect(result).toEqual({
      status: "success",
      message: "Daily goal ranges saved.",
      fieldErrors: {},
    });
    expect(insertMock).toHaveBeenCalledWith({
      user_id: "user-1",
      effective_date: "2026-07-19",
      calories_target: 1700,
      protein_target: 120,
      carbohydrates_target: 230,
      fat_target: 70,
      calories_min: 1500,
      calories_max: 1700,
      protein_min: 90,
      protein_max: 120,
      carbohydrates_min: 180,
      carbohydrates_max: 230,
      fat_min: 50,
      fat_max: 70,
    });
    expect(console.info).toHaveBeenCalledWith(
      "[settings:saveDailyGoalRanges] Authenticated user session confirmed.",
      { userId: "user-1" },
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/settings");
    expect(revalidatePathMock).toHaveBeenCalledWith("/today");
    expect(revalidatePathMock).toHaveBeenCalledWith("/history");
  });

  it("updates today's existing goal range for the authenticated user", async () => {
    const updateMock = vi.fn(() => ({ error: null }));
    const maybeSingleMock = vi
      .fn()
      .mockResolvedValueOnce({ data: { timezone: "UTC" }, error: null })
      .mockResolvedValueOnce({ data: { id: "goal-1" }, error: null });
    const supabase = createSettingsSupabaseMock({
      insertMock: vi.fn(),
      maybeSingleMock,
      updateMock,
      user: { id: "user-1" },
    });
    createServerSupabaseClientMock.mockResolvedValue(supabase);

    const result = await save(formDataWithRanges());

    expect(result.status).toBe("success");
    expect(updateMock).toHaveBeenCalledWith({
      calories_target: 1700,
      protein_target: 120,
      carbohydrates_target: 230,
      fat_target: 70,
      calories_min: 1500,
      calories_max: 1700,
      protein_min: 90,
      protein_max: 120,
      carbohydrates_min: 180,
      carbohydrates_max: 230,
      fat_min: 50,
      fat_max: 70,
    });
  });

  it("rejects invalid ranges before touching Supabase", async () => {
    const result = await save(
      formDataWithRanges({
        caloriesMin: "1800",
        caloriesMax: "1500",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toBe("Please fix the highlighted fields.");
    expect(result.fieldErrors.caloriesMin).toBe(goalRangeOrderMessage);
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated saves without writing daily goals", async () => {
    const fromMock = vi.fn();
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
      from: fromMock,
    });

    const result = await save(formDataWithRanges());

    expect(result).toEqual({
      status: "error",
      message: "You must be signed in to update daily goals.",
      fieldErrors: {},
    });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("logs complete Supabase errors and returns a specific migration message", async () => {
    const missingColumnError = {
      code: "42703",
      details: null,
      hint: null,
      message: "column daily_goals.calories_min does not exist",
    };
    const maybeSingleMock = vi
      .fn()
      .mockResolvedValueOnce({ data: { timezone: "UTC" }, error: null })
      .mockResolvedValueOnce({ data: null, error: null });
    const insertMock = vi.fn().mockResolvedValue({ error: missingColumnError });
    const supabase = createSettingsSupabaseMock({
      insertMock,
      maybeSingleMock,
      user: { id: "user-1" },
    });
    createServerSupabaseClientMock.mockResolvedValue(supabase);

    const result = await save(formDataWithRanges());

    expect(result.status).toBe("error");
    expect(result.message).toBe(
      "Daily goal range columns are missing in Supabase. Apply the latest migration, then try again.",
    );
    expect(console.error).toHaveBeenCalledWith(
      "[settings:saveDailyGoalRanges] daily_goals.save failed",
      {
        code: "42703",
        details: null,
        effectiveDate: "2026-07-19",
        hint: null,
        message: "column daily_goals.calories_min does not exist",
        operation: "insert",
        userId: "user-1",
      },
    );
  });
});

async function save(formData: FormData) {
  const { saveDailyGoalRangesAction } = await import("@/features/settings/actions");
  const previousState: DailyGoalRangeActionState = {
    status: "idle",
    message: null,
    fieldErrors: {},
  };

  return saveDailyGoalRangesAction(previousState, formData);
}

function formDataWithRanges(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values = {
    caloriesMin: "1500",
    caloriesMax: "1700",
    proteinMin: "90",
    proteinMax: "120",
    carbohydratesMin: "180",
    carbohydratesMax: "230",
    fatMin: "50",
    fatMax: "70",
    ...overrides,
  };

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

function createSettingsSupabaseMock({
  insertMock,
  maybeSingleMock,
  updateMock = vi.fn(() => ({ error: null })),
  user,
}: {
  insertMock: ReturnType<typeof vi.fn>;
  maybeSingleMock: ReturnType<typeof vi.fn>;
  updateMock?: ReturnType<typeof vi.fn>;
  user: { id: string };
}) {
  const eqMock = vi.fn(() => queryBuilder);
  const selectMock = vi.fn(() => queryBuilder);
  const limitMock = vi.fn(() => queryBuilder);
  const queryBuilder = {
    eq: eqMock,
    limit: limitMock,
    maybeSingle: maybeSingleMock,
    select: selectMock,
  };
  const updateBuilder = {
    eq: vi.fn(() => updateBuilder),
    then: (resolve: (value: { error: unknown }) => unknown) =>
      Promise.resolve(updateMock.mock.results.at(-1)?.value ?? { error: null }).then(resolve),
  };

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      if (table !== "daily_goals" && table !== "profiles") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        insert: insertMock,
        select: selectMock,
        update: vi.fn((values) => {
          updateMock(values);
          return updateBuilder;
        }),
      };
    }),
  };
}
