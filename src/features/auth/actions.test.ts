import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthActionState } from "@/features/auth/types";

const { createServerSupabaseClientMock, redirectMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://anar.pegah.no/");
    vi.stubEnv("NODE_ENV", "production");
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the canonical production callback URL for signup confirmation", async () => {
    const signUpMock = vi.fn().mockResolvedValue({
      data: {
        session: null,
      },
      error: null,
    });
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        signUp: signUpMock,
      },
    });

    const result = await signup(signupFormData());

    expect(result).toEqual({
      status: "success",
      message:
        "Account created. If email confirmation is enabled, check your inbox for a verification link.",
      fieldErrors: {},
    });
    expect(signUpMock).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: "https://anar.pegah.no/auth/callback?next=%2Ftoday",
        }),
      }),
    );
    expect(signUpMock.mock.calls[0][0].options.emailRedirectTo).not.toContain("localhost");
  });

  it("uses the canonical production callback URL for password reset", async () => {
    const resetPasswordForEmailMock = vi.fn().mockResolvedValue({
      error: null,
    });
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        resetPasswordForEmail: resetPasswordForEmailMock,
      },
    });

    const result = await forgotPassword(emailFormData());

    expect(result).toEqual({
      status: "success",
      message: "If an account exists for that email, a reset link will be sent.",
      fieldErrors: {},
    });
    expect(resetPasswordForEmailMock).toHaveBeenCalledWith("peg@example.com", {
      redirectTo: "https://anar.pegah.no/auth/callback?next=%2Freset-password",
    });
    expect(resetPasswordForEmailMock.mock.calls[0][1].redirectTo).not.toContain("localhost");
  });
});

async function signup(formData: FormData) {
  const { signupAction } = await import("@/features/auth/actions");
  return signupAction(initialState(), formData);
}

async function forgotPassword(formData: FormData) {
  const { forgotPasswordAction } = await import("@/features/auth/actions");
  return forgotPasswordAction(initialState(), formData);
}

function initialState(): AuthActionState {
  return {
    status: "idle",
    message: null,
    fieldErrors: {},
  };
}

function signupFormData() {
  const formData = new FormData();
  formData.set("displayName", "Pegah");
  formData.set("email", "peg@example.com");
  formData.set("password", "strong-password");
  formData.set("confirmPassword", "strong-password");
  formData.set("termsAccepted", "on");
  formData.set("timezone", "Europe/Oslo");
  return formData;
}

function emailFormData() {
  const formData = new FormData();
  formData.set("email", "peg@example.com");
  return formData;
}
