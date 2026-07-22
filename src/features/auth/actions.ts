"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSafeRedirectPath } from "@/features/auth/redirects";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/features/auth/schemas";
import type { AuthActionState, AuthFieldErrors } from "@/features/auth/types";
import {
  ApplicationUrlConfigurationError,
  createApplicationUrl,
} from "@/lib/application-url";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SignupDiagnosticStage =
  | "signup_action_entered"
  | "form_data_parsed"
  | "validation_completed"
  | "creating_supabase_client"
  | "supabase_client_created"
  | "building_email_redirect_url"
  | "before_auth_sign_up"
  | "after_auth_sign_up";

type NormalizedAuthActionError = {
  code?: string;
  message: string;
  name?: string;
  status?: number;
};

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(readFormData(formData));

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return authError(error.message);
  }

  redirect(getSafeRedirectPath(parsed.data.next));
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  let stage: SignupDiagnosticStage = "signup_action_entered";
  logSignupStage(stage);

  const formValues = readFormData(formData);
  stage = "form_data_parsed";
  logSignupStage(stage);

  const parsed = signupSchema.safeParse(formValues);
  stage = "validation_completed";

  if (!parsed.success) {
    logSignupStage(stage, { validationSucceeded: false });
    return validationError(parsed.error);
  }

  logSignupStage(stage, { validationSucceeded: true });

  let signUpData: Awaited<
    ReturnType<Awaited<ReturnType<typeof createServerSupabaseClient>>["auth"]["signUp"]>
  >["data"];

  try {
    stage = "creating_supabase_client";
    const supabase = await createServerSupabaseClient();
    stage = "supabase_client_created";
    logSignupStage(stage);

    stage = "building_email_redirect_url";
    const emailRedirectTo = getSignupEmailRedirectTo();

    stage = "before_auth_sign_up";
    logSignupStage(stage, { hasEmailRedirectTo: Boolean(emailRedirectTo) });

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
        data: {
          display_name: parsed.data.displayName || null,
          timezone: parsed.data.timezone || "UTC",
        },
      },
    });

    stage = "after_auth_sign_up";
    logSignupStage(stage, {
      hasSession: Boolean(data.session),
      hasUser: Boolean(data.user),
      supabaseError: error ? normalizeAuthActionError(error) : null,
    });

    if (error) {
      logSignupError("auth.signUp returned an error", error, {
        hasSession: Boolean(data.session),
        hasUser: Boolean(data.user),
        stage,
      });
      return authError(error.message);
    }

    signUpData = data;
  } catch (error) {
    logSignupError("signup action failed before completion", error, { stage });
    return authError("Unexpected signup failure.");
  }

  if (signUpData.session) {
    redirect("/today");
  }

  return {
    status: "success",
    message:
      "Account created. If email confirmation is enabled, check your inbox for a verification link.",
    fieldErrors: {},
  };
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse(readFormData(formData));

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: createApplicationUrl("/auth/callback", {
      next: "/reset-password",
    }).toString(),
  });

  if (error) {
    return authError(error.message);
  }

  return {
    status: "success",
    message: "If an account exists for that email, a reset link will be sent.",
    fieldErrors: {},
  };
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse(readFormData(formData));

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return authError(error.message);
  }

  redirect("/login");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function readFormData(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function getSignupEmailRedirectTo() {
  try {
    return createApplicationUrl("/auth/callback", {
      next: "/today",
    }).toString();
  } catch (error) {
    if (error instanceof ApplicationUrlConfigurationError) {
      logSignupError("email redirect URL could not be configured", error, {
        stage: "building_email_redirect_url",
      });
      return undefined;
    }

    throw error;
  }
}

function logSignupStage(
  stage: SignupDiagnosticStage,
  details: Record<string, unknown> = {},
) {
  if (process.env.AUTH_SIGNUP_DEBUG !== "1") {
    return;
  }

  console.info("[auth:signup] stage reached", {
    operation: "signup",
    stage,
    ...details,
  });
}

function logSignupError(
  context: string,
  error: unknown,
  details: Record<string, unknown> = {},
) {
  const normalized = normalizeAuthActionError(error);

  console.error(`[auth:signup] ${context}`, {
    operation: "signup",
    code: normalized.code,
    message: normalized.message,
    name: normalized.name,
    status: normalized.status,
    ...details,
  });
}

function normalizeAuthActionError(error: unknown): NormalizedAuthActionError {
  if (typeof error === "string") {
    return {
      message: error,
    };
  }

  if (!error || typeof error !== "object") {
    return {
      message: "Unknown auth action error",
    };
  }

  const record = error as Record<string, unknown>;

  return {
    code: readString(record.code),
    message: readString(record.message) ?? "Unknown auth action error",
    name: readString(record.name),
    status: readNumber(record.status),
  };
}

function readString(value: unknown) {
  return typeof value === "string" && value ? value : undefined;
}

function readNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function validationError(error: z.ZodError): AuthActionState {
  const fieldErrors: AuthFieldErrors = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (
      (field === "email" ||
        field === "password" ||
        field === "confirmPassword" ||
        field === "displayName" ||
        field === "termsAccepted") &&
      !fieldErrors[field]
    ) {
      fieldErrors[field] = issue.message;
    }
  });

  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors,
  };
}

function authError(message: string): AuthActionState {
  return {
    status: "error",
    message: translateAuthError(message),
    fieldErrors: {},
  };
}

function translateAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Your email has not been confirmed yet.";
  }

  if (normalized.includes("user already registered")) {
    return "An account already exists for this email.";
  }

  if (normalized.includes("password")) {
    return "The password is not valid.";
  }

  return "Something went wrong. Please try again.";
}
