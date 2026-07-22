import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

describe("auth callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exchanges a valid code and redirects to a safe internal next path", async () => {
    const exchangeCodeForSessionMock = vi.fn().mockResolvedValue({ error: null });
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        exchangeCodeForSession: exchangeCodeForSessionMock,
      },
    });

    const response = await get("https://anar.pegah.no/auth/callback?code=abc&next=/today");

    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith("abc");
    expect(response.headers.get("location")).toBe("https://anar.pegah.no/today");
  });

  it("marks reset-password callbacks as ready after a successful exchange", async () => {
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      },
    });

    const response = await get(
      "https://anar.pegah.no/auth/callback?code=abc&next=/reset-password",
    );

    expect(response.headers.get("location")).toBe(
      "https://anar.pegah.no/reset-password?auth_status=password_reset_ready",
    );
  });

  it("redirects email-change callbacks to profile with a success state", async () => {
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      },
    });

    const response = await get("https://anar.pegah.no/auth/callback?code=abc&next=/profile");

    expect(revalidatePathMock).toHaveBeenCalledWith("/profile");
    expect(response.headers.get("location")).toBe(
      "https://anar.pegah.no/profile?auth_status=email_updated",
    );
  });

  it("redirects missing codes to login with a safe error code", async () => {
    const response = await get("https://anar.pegah.no/auth/callback?next=/today");

    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "https://anar.pegah.no/login?auth_error=auth_link_invalid",
    );
  });

  it("redirects failed exchanges without exposing raw Supabase errors", async () => {
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({
          error: {
            code: "otp_expired",
            message: "Email link is expired",
            status: 403,
          },
        }),
      },
    });

    const response = await get(
      "https://anar.pegah.no/auth/callback?code=abc&next=/reset-password",
    );
    const redirectUrl = new URL(response.headers.get("location") ?? "");

    expect(redirectUrl.pathname).toBe("/forgot-password");
    expect(redirectUrl.searchParams.get("auth_error")).toBe("auth_link_expired");
    expect(redirectUrl.search).not.toContain("Email");
  });

  it("falls back to /today for attempted external redirects", async () => {
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      },
    });

    const response = await get(
      "https://anar.pegah.no/auth/callback?code=abc&next=https://evil.example/profile",
    );

    expect(response.headers.get("location")).toBe("https://anar.pegah.no/today");
  });

  it("handles Supabase provider error parameters safely", async () => {
    const response = await get(
      "https://anar.pegah.no/auth/callback?error=access_denied&error_description=raw-secret&next=/profile",
    );
    const redirectUrl = new URL(response.headers.get("location") ?? "");

    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
    expect(redirectUrl.pathname).toBe("/profile");
    expect(redirectUrl.searchParams.get("auth_error")).toBe("auth_provider_error");
    expect(redirectUrl.searchParams.has("next")).toBe(false);
    expect(redirectUrl.search).not.toContain("raw-secret");
  });
});

async function get(url: string) {
  const { GET } = await import("@/app/auth/callback/route");

  return GET({
    url,
  } as never);
}
