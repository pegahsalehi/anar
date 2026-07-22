import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

describe("Supabase admin client configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_preferred");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.stubGlobal("window", undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("uses SUPABASE_SECRET_KEY as the preferred server-only admin key", async () => {
    createClientMock.mockReturnValue({ auth: {}, storage: {} });

    const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");

    createSupabaseAdminClient();

    expect(createClientMock).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "sb_secret_preferred",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  });

  it("supports SUPABASE_SERVICE_ROLE_KEY as a documented compatibility fallback", async () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
    createClientMock.mockReturnValue({ auth: {}, storage: {} });

    const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");

    createSupabaseAdminClient();

    expect(createClientMock).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "service-role-key",
      expect.any(Object),
    );
  });

  it("throws a clear error when admin key configuration is missing", async () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");

    expect(() => createSupabaseAdminClient()).toThrow(
      "Missing Supabase admin environment variables: SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY",
    );
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
