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
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://anar.pegah.no/");
    vi.stubEnv("NODE_ENV", "production");
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`);
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("returns validation errors before creating a Supabase client", async () => {
    const result = await signup(new FormData());

    expect(result.status).toBe("error");
    expect(result.message).toBe("Please fix the highlighted fields.");
    expect(result.fieldErrors).toEqual(
      expect.objectContaining({
        displayName: "Invalid input: expected string, received undefined",
        email: "Invalid input: expected string, received undefined",
        password: "Invalid input: expected string, received undefined",
      }),
    );
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("uses the canonical production callback URL for signup confirmation", async () => {
    const signUpMock = vi.fn().mockResolvedValue({
      data: {
        session: null,
        user: {
          id: "user_123",
        },
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

  it("reaches auth.signUp without throwing when the production site URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

    const signUpMock = vi.fn().mockResolvedValue({
      data: {
        session: null,
        user: {
          id: "user_123",
        },
      },
      error: null,
    });
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        signUp: signUpMock,
      },
    });

    await expect(signup(signupFormData())).resolves.toEqual({
      status: "success",
      message:
        "Account created. If email confirmation is enabled, check your inbox for a verification link.",
      fieldErrors: {},
    });
    expect(signUpMock).toHaveBeenCalledTimes(1);
    expect(signUpMock.mock.calls[0][0].options).not.toHaveProperty("emailRedirectTo");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[auth:signup] email redirect URL could not be configured",
      expect.objectContaining({
        code: undefined,
        message: "NEXT_PUBLIC_SITE_URL must be set to the production application URL.",
        operation: "signup",
        stage: "building_email_redirect_url",
      }),
    );
  });

  it("returns Supabase signup errors as form state", async () => {
    const signUpMock = vi.fn().mockResolvedValue({
      data: {
        session: null,
        user: null,
      },
      error: {
        code: "user_already_exists",
        message: "User already registered",
        status: 400,
      },
    });
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        signUp: signUpMock,
      },
    });

    await expect(signup(signupFormData())).resolves.toEqual({
      status: "error",
      message: "An account already exists for this email.",
      fieldErrors: {},
    });
    expect(signUpMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[auth:signup] auth.signUp returned an error",
      expect.objectContaining({
        code: "user_already_exists",
        hasSession: false,
        hasUser: false,
        message: "User already registered",
        operation: "signup",
        stage: "after_auth_sign_up",
        status: 400,
      }),
    );
  });

  it("redirects to today when signup returns an authenticated session", async () => {
    const signUpMock = vi.fn().mockResolvedValue({
      data: {
        session: {},
        user: {
          id: "user_123",
        },
      },
      error: null,
    });
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        signUp: signUpMock,
      },
    });

    await expect(signup(signupFormData())).rejects.toThrow("NEXT_REDIRECT:/today");
    expect(signUpMock).toHaveBeenCalledTimes(1);
  });

  it("returns an error state when Supabase client creation fails", async () => {
    createServerSupabaseClientMock.mockRejectedValue(
      new Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL"),
    );

    await expect(signup(signupFormData())).resolves.toEqual({
      status: "error",
      message: "Something went wrong. Please try again.",
      fieldErrors: {},
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[auth:signup] signup action failed before completion",
      expect.objectContaining({
        message: "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL",
        operation: "signup",
        stage: "creating_supabase_client",
      }),
    );
  });

  it("keeps existing login redirect behavior", async () => {
    const signInWithPasswordMock = vi.fn().mockResolvedValue({
      error: null,
    });
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        signInWithPassword: signInWithPasswordMock,
      },
    });

    await expect(login(loginFormData("/foods"))).rejects.toThrow("NEXT_REDIRECT:/foods");
    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "peg@example.com",
      password: "strong-password",
    });
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

async function login(formData: FormData) {
  const { loginAction } = await import("@/features/auth/actions");
  return loginAction(initialState(), formData);
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

function loginFormData(nextPath: string) {
  const formData = new FormData();
  formData.set("email", "peg@example.com");
  formData.set("password", "strong-password");
  formData.set("next", nextPath);
  return formData;
}
