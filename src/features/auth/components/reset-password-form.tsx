"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { PasswordInputField } from "@/features/auth/components/password-input-field";
import { initialAuthState, type AuthActionState } from "@/features/auth/types";

type ResetPasswordFormProps = {
  initialState?: AuthActionState;
};

export function ResetPasswordForm({ initialState }: ResetPasswordFormProps) {
  const [state, formAction] = useActionState(
    resetPasswordAction,
    initialState ?? initialAuthState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
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
