"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { forgotPasswordAction } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { initialAuthState } from "@/features/auth/types";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, initialAuthState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <AuthMessage state={state} />
      <label className="block">
        <span className="text-sm font-medium text-foreground">Email</span>
        <span className="mt-2 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-3">
          <Mail aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          <input
            aria-describedby={state.fieldErrors.email ? "forgot-email-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors.email)}
            autoComplete="email"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            name="email"
            placeholder="you@example.com"
            type="email"
          />
        </span>
        {state.fieldErrors.email ? (
          <span className="mt-2 block text-sm text-coral" id="forgot-email-error">
            {state.fieldErrors.email}
          </span>
        ) : null}
      </label>
      <AuthSubmitButton>Send reset link</AuthSubmitButton>
    </form>
  );
}
