import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getSafeRedirectPath } from "@/features/auth/redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const providerError = requestUrl.searchParams.get("error");
  const providerErrorCode = requestUrl.searchParams.get("error_code") ?? providerError;
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  if (providerErrorCode) {
    logAuthCallbackError("provider.callbackError", {
      code: providerErrorCode,
    });

    return NextResponse.redirect(
      getAuthCallbackErrorRedirectUrl(request.url, next, "auth_provider_error"),
    );
  }

  if (!code) {
    logAuthCallbackError("callback.missingCode", {
      code: "missing_code",
    });

    return NextResponse.redirect(
      getAuthCallbackErrorRedirectUrl(request.url, next, "auth_link_invalid"),
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const normalized = normalizeAuthCallbackError(error);
    const errorCode = getExchangeErrorCode(normalized);

    logAuthCallbackError("auth.exchangeCodeForSession", {
      code: normalized.code ?? errorCode,
      message: normalized.message,
      name: normalized.name,
      status: normalized.status,
    });

    return NextResponse.redirect(getAuthCallbackErrorRedirectUrl(request.url, next, errorCode));
  }

  if (next === "/profile") {
    revalidatePath("/profile");
  }

  return NextResponse.redirect(getAuthCallbackSuccessRedirectUrl(request.url, next));
}

function getAuthCallbackSuccessRedirectUrl(requestUrl: string, next: string) {
  const redirectUrl = new URL(next, requestUrl);

  if (next === "/reset-password") {
    redirectUrl.searchParams.set("auth_status", "password_reset_ready");
  }

  if (next === "/profile") {
    redirectUrl.searchParams.set("auth_status", "email_updated");
  }

  return redirectUrl;
}

function getAuthCallbackErrorRedirectUrl(
  requestUrl: string,
  next: string,
  errorCode: AuthCallbackErrorCode,
) {
  const redirectUrl =
    next === "/reset-password"
      ? new URL("/forgot-password", requestUrl)
      : next === "/profile"
        ? new URL("/profile", requestUrl)
      : new URL("/login", requestUrl);

  redirectUrl.searchParams.set("auth_error", errorCode);

  if (next !== "/today" && next !== "/profile") {
    redirectUrl.searchParams.set("next", next);
  }

  return redirectUrl;
}

type AuthCallbackErrorCode =
  | "auth_callback_failed"
  | "auth_link_expired"
  | "auth_link_invalid"
  | "auth_provider_error";

type NormalizedAuthCallbackError = {
  code?: string;
  message: string;
  name?: string;
  status?: number;
};

function getExchangeErrorCode(error: NormalizedAuthCallbackError): AuthCallbackErrorCode {
  const searchable = [error.code, error.message, error.name].filter(Boolean).join(" ").toLowerCase();

  if (searchable.includes("expired")) {
    return "auth_link_expired";
  }

  if (
    searchable.includes("already") ||
    searchable.includes("invalid") ||
    searchable.includes("used") ||
    searchable.includes("not found")
  ) {
    return "auth_link_invalid";
  }

  return "auth_callback_failed";
}

function logAuthCallbackError(
  operation: string,
  details: {
    code?: string;
    message?: string;
    name?: string;
    status?: number;
  },
) {
  console.error("[auth:callback] operation failed", {
    operation,
    code: details.code,
    message: details.message,
    name: details.name,
    status: details.status,
  });
}

function normalizeAuthCallbackError(error: unknown): NormalizedAuthCallbackError {
  if (typeof error === "string") {
    return {
      message: error,
    };
  }

  if (!error || typeof error !== "object") {
    return {
      message: "Unknown Supabase auth callback error",
    };
  }

  const record = error as Record<string, unknown>;

  return {
    code: readString(record.code),
    message: readString(record.message) ?? "Unknown Supabase auth callback error",
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
