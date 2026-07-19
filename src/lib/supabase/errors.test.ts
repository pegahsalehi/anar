import { describe, expect, it } from "vitest";
import { isRealSupabaseRequestError } from "@/lib/supabase/errors";

describe("isRealSupabaseRequestError", () => {
  it("ignores empty errors", () => {
    expect(isRealSupabaseRequestError(null)).toBe(false);
    expect(isRealSupabaseRequestError(undefined)).toBe(false);
  });

  it("treats expected optional no-row responses as non-errors", () => {
    expect(
      isRealSupabaseRequestError({
        code: "PGRST116",
        details: "The result contains 0 rows",
        message: "JSON object requested, multiple (or no) rows returned",
      }),
    ).toBe(false);
  });

  it("keeps real Supabase request failures", () => {
    expect(
      isRealSupabaseRequestError({
        code: "42501",
        message: "permission denied for table daily_goals",
      }),
    ).toBe(true);
  });
});
