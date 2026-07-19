"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction } from "@/features/settings/actions";
import {
  initialChangePasswordActionState,
} from "@/features/settings/types";
import { PasswordInputField } from "@/features/auth/components/password-input-field";
import {
  SettingsActionMessage,
  SettingsSubmitButton,
} from "@/features/settings/components/daily-goal-ranges-form";

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(
    changePasswordAction,
    initialChangePasswordActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      action={formAction}
      className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6"
      ref={formRef}
    >
      <div>
        <h2 className="text-lg font-semibold text-card-foreground">Change password</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Confirm your current password before saving a new one.
        </p>
      </div>

      <SettingsActionMessage message={state.message} status={state.status} />

      <div className="mt-5 grid gap-4">
        <PasswordInputField
          autoComplete="current-password"
          error={state.fieldErrors.currentPassword}
          errorId="settings-current-password-error"
          label="Current password"
          name="currentPassword"
          placeholder="Enter current password"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <PasswordInputField
            autoComplete="new-password"
            error={state.fieldErrors.newPassword}
            errorId="settings-new-password-error"
            label="New password"
            name="newPassword"
            placeholder="At least 8 characters"
          />
          <PasswordInputField
            autoComplete="new-password"
            error={state.fieldErrors.confirmNewPassword}
            errorId="settings-confirm-new-password-error"
            label="Confirm new password"
            name="confirmNewPassword"
            placeholder="Repeat new password"
          />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Use at least 8 characters with a letter and a number.
      </p>

      <div className="mt-5 flex justify-end">
        <SettingsSubmitButton>Update password</SettingsSubmitButton>
      </div>
    </form>
  );
}
