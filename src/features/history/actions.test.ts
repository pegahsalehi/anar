import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

describe("getHistoryDayDetailsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads owned food-log snapshots for one local log date", async () => {
    const supabaseMock = createHistoryDetailsSupabaseMock({
      rows: [
        {
          id: "log-1",
          user_id: "user-1",
          food_name_snapshot: "Old saved feta name",
          consumed_grams: 23,
          logged_at: "2026-07-21T20:30:00.000Z",
          local_log_date: "2026-07-21",
        },
        {
          id: "log-2",
          user_id: "user-1",
          food_name_snapshot: "Walnut",
          consumed_grams: 17.5,
          logged_at: "2026-07-21T21:00:00.000Z",
          local_log_date: "2026-07-21",
        },
      ],
    });
    createServerSupabaseClientMock.mockResolvedValue(supabaseMock.supabase);

    const result = await loadDetails("2026-07-21");

    expect(supabaseMock.eqMock).toHaveBeenCalledWith("user_id", "user-1");
    expect(supabaseMock.eqMock).toHaveBeenCalledWith("local_log_date", "2026-07-21");
    expect(supabaseMock.orderMock).toHaveBeenCalledWith("logged_at", { ascending: true });
    expect(result).toEqual({
      date: "2026-07-21",
      error: null,
      logs: [
        {
          id: "log-1",
          foodName: "Old saved feta name",
          grams: 23,
          gramLabel: "23 g",
          loggedAt: "2026-07-21T20:30:00.000Z",
        },
        {
          id: "log-2",
          foodName: "Walnut",
          grams: 17.5,
          gramLabel: "17.5 g",
          loggedAt: "2026-07-21T21:00:00.000Z",
        },
      ],
    });
  });

  it("does not query Supabase for invalid dates", async () => {
    const result = await loadDetails("2026-7-21");

    expect(result).toEqual({
      date: "2026-7-21",
      logs: [],
      error: "This history date is not valid.",
    });
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated users before querying food logs", async () => {
    const fromMock = vi.fn();
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
      from: fromMock,
    });

    const result = await loadDetails("2026-07-21");

    expect(result).toEqual({
      date: "2026-07-21",
      logs: [],
      error: "You must be signed in.",
    });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("uses local_log_date instead of UTC created_at boundaries", async () => {
    const supabaseMock = createHistoryDetailsSupabaseMock({
      rows: [
        {
          id: "late-log",
          user_id: "user-1",
          food_name_snapshot: "Late local snack",
          consumed_grams: 40,
          logged_at: "2026-07-20T23:30:00.000Z",
          local_log_date: "2026-07-21",
        },
      ],
    });
    createServerSupabaseClientMock.mockResolvedValue(supabaseMock.supabase);

    await loadDetails("2026-07-21");

    expect(supabaseMock.eqMock).toHaveBeenCalledWith("local_log_date", "2026-07-21");
    expect(supabaseMock.gteMock).not.toHaveBeenCalled();
    expect(supabaseMock.lteMock).not.toHaveBeenCalled();
  });

  it("returns a safe error when the owned food-log query fails", async () => {
    const supabaseMock = createHistoryDetailsSupabaseMock({
      error: { message: "permission denied" },
      rows: [],
    });
    createServerSupabaseClientMock.mockResolvedValue(supabaseMock.supabase);

    const result = await loadDetails("2026-07-21");

    expect(result).toEqual({
      date: "2026-07-21",
      logs: [],
      error: "Food logs could not be loaded for this day.",
    });
  });
});

async function loadDetails(date: string) {
  const { getHistoryDayDetailsAction } = await import("@/features/history/actions");
  return getHistoryDayDetailsAction(date);
}

function createHistoryDetailsSupabaseMock({
  error = null,
  rows,
}: {
  error?: unknown;
  rows: Array<{
    consumed_grams: number;
    food_name_snapshot: string;
    id: string;
    local_log_date: string;
    logged_at: string;
    user_id: string;
  }>;
}) {
  const gteMock = vi.fn(() => queryBuilder);
  const lteMock = vi.fn(() => queryBuilder);
  const eqMock = vi.fn(() => queryBuilder);
  const orderMock = vi.fn().mockResolvedValue({ data: rows, error });
  const queryBuilder = {
    eq: eqMock,
    gte: gteMock,
    lte: lteMock,
    order: orderMock,
  };

  return {
    eqMock,
    gteMock,
    lteMock,
    orderMock,
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
        }),
      },
      from: vi.fn((table: string) => {
        if (table !== "food_logs") {
          throw new Error(`Unexpected table ${table}`);
        }

        return {
          select: vi.fn(() => queryBuilder),
        };
      }),
    },
  };
}
