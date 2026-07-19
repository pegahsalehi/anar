"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";
import { resetPasswordAction } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { initialAuthState } from "@/features/auth/types";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialAuthState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <AuthMessage state={state} />
      <label className="block">
        <span className="text-sm font-medium text-foreground">New password</span>
        <span className="mt-2 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-3">
          <LockKeyhole aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          <input
            aria-describedby={state.fieldErrors.password ? "reset-password-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors.password)}
            autoComplete="new-password"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            name="password"
            placeholder="At least 8 characters"
            type="password"
          />
        </span>
        {state.fieldErrors.password ? (
          <span className="mt-2 block text-sm text-coral" id="reset-password-error">
            {state.fieldErrors.password}
          </span>
        ) : null}
      </label>
      <AuthSubmitButton>Save new password</AuthSubmitButton>
    </form>
  );
}
