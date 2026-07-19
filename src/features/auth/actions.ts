"use server";

import { headers } from "next/headers";
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
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  const parsed = signupSchema.safeParse(readFormData(formData));

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const origin = await getRequestOrigin();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/today`,
      data: {
        display_name: parsed.data.displayName || null,
        timezone: parsed.data.timezone || "UTC",
      },
    },
  });

  if (error) {
    return authError(error.message);
  }

  if (data.session) {
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

  const origin = await getRequestOrigin();
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
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

function validationError(error: z.ZodError): AuthActionState {
  const fieldErrors: AuthFieldErrors = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (
      (field === "email" ||
        field === "password" ||
        field === "confirmPassword" ||
        field === "displayName") &&
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

async function getRequestOrigin() {
  const headerStore = await headers();
  return headerStore.get("origin") ?? "http://localhost:3000";
}
