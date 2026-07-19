import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AppPreferenceActionState,
  DailyNutritionTargetActionState,
} from "@/features/settings/types";

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

describe("saveDailyNutritionTargetsAction", () => {
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

  it("saves valid targets for the authenticated user and revalidates dependent pages", async () => {
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

    const result = await save(formDataWithTargets());

    expect(result).toEqual({
      status: "success",
      message: "Daily nutrition targets saved.",
      fieldErrors: {},
    });
    expect(insertMock).toHaveBeenCalledWith({
      user_id: "user-1",
      effective_date: "2026-07-19",
      calories_target: 1600,
      protein_target: 105,
      carbohydrates_target: 205,
      fat_target: 60,
    });
    expect(console.info).toHaveBeenCalledWith(
      "[settings:saveDailyNutritionTargets] Authenticated user session confirmed.",
      { userId: "user-1" },
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/settings");
    expect(revalidatePathMock).toHaveBeenCalledWith("/today");
    expect(revalidatePathMock).toHaveBeenCalledWith("/history");
  });

  it("updates today's existing nutrition targets for the authenticated user", async () => {
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

    const result = await save(formDataWithTargets());

    expect(result.status).toBe("success");
    expect(updateMock).toHaveBeenCalledWith({
      calories_target: 1600,
      protein_target: 105,
      carbohydrates_target: 205,
      fat_target: 60,
    });
  });

  it("rejects invalid targets before touching Supabase", async () => {
    const result = await save(
      formDataWithTargets({
        caloriesTarget: "nope",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toBe("Please fix the highlighted fields.");
    expect(result.fieldErrors.caloriesTarget).toBe("Please enter a valid number.");
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated saves without writing daily nutrition targets", async () => {
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

    const result = await save(formDataWithTargets());

    expect(result).toEqual({
      status: "error",
      message: "You must be signed in to update daily nutrition targets.",
      fieldErrors: {},
    });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("logs complete Supabase errors and returns a specific migration message", async () => {
    const missingColumnError = {
      code: "42703",
      details: null,
      hint: null,
      message: "column daily_goals.fat_target does not exist",
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

    const result = await save(formDataWithTargets());

    expect(result.status).toBe("error");
    expect(result.message).toBe(
      "Daily nutrition target columns are missing in Supabase. Apply the latest migration, then try again.",
    );
    expect(console.error).toHaveBeenCalledWith(
      "[settings:saveDailyNutritionTargets] daily_goals.save failed",
      {
        code: "42703",
        details: null,
        effectiveDate: "2026-07-19",
        hint: null,
        message: "column daily_goals.fat_target does not exist",
        operation: "insert",
        userId: "user-1",
      },
    );
  });
});

describe("saveAppPreferencesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("saves app preferences for the authenticated user and revalidates dependent pages", async () => {
    const updateMock = vi.fn(() => ({ error: null }));
    const supabase = createSettingsSupabaseMock({
      insertMock: vi.fn(),
      maybeSingleMock: vi.fn(),
      updateMock,
      user: { id: "user-1" },
    });
    createServerSupabaseClientMock.mockResolvedValue(supabase);

    const formData = new FormData();
    formData.set("weekStartsOn", "sunday");
    formData.set("timeFormat", "24h");

    const result = await savePreferences(formData);

    expect(result).toEqual({
      status: "success",
      message: "App preferences saved.",
      fieldErrors: {},
    });
    expect(updateMock).toHaveBeenCalledWith({
      week_starts_on: "sunday",
      time_format: "24h",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/settings");
    expect(revalidatePathMock).toHaveBeenCalledWith("/today");
    expect(revalidatePathMock).toHaveBeenCalledWith("/history");
  });

  it("rejects invalid app preferences before touching Supabase", async () => {
    const formData = new FormData();
    formData.set("weekStartsOn", "friday");
    formData.set("timeFormat", "24h");

    const result = await savePreferences(formData);

    expect(result.status).toBe("error");
    expect(result.message).toBe("Please fix the highlighted fields.");
    expect(result.fieldErrors.weekStartsOn).toBe(
      "Choose whether weeks start on Sunday or Monday.",
    );
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });
});

async function save(formData: FormData) {
  const { saveDailyNutritionTargetsAction } = await import("@/features/settings/actions");
  const previousState: DailyNutritionTargetActionState = {
    status: "idle",
    message: null,
    fieldErrors: {},
  };

  return saveDailyNutritionTargetsAction(previousState, formData);
}

async function savePreferences(formData: FormData) {
  const { saveAppPreferencesAction } = await import("@/features/settings/actions");
  const previousState: AppPreferenceActionState = {
    status: "idle",
    message: null,
    fieldErrors: {},
  };

  return saveAppPreferencesAction(previousState, formData);
}

function formDataWithTargets(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values = {
    caloriesTarget: "1600",
    proteinTarget: "105",
    carbohydratesTarget: "205",
    fatTarget: "60",
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
