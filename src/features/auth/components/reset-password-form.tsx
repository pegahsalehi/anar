"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { PasswordInputField } from "@/features/auth/components/password-input-field";
import { initialAuthState } from "@/features/auth/types";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialAuthState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <AuthMessage state={state} />
      <PasswordInputField
        autoComplete="new-password"
        error={state.fieldErrors.password}
        errorId="reset-password-error"
        label="New password"
        name="password"
        placeholder="At least 8 characters"
      />
      <AuthSubmitButton>Save new password</AuthSubmitButton>
    </form>
  );
}
