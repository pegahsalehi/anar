"use client";

import { useActionState, useEffect, useState } from "react";
import { Mail, UserRound } from "lucide-react";
import { signupAction } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { PasswordInputField } from "@/features/auth/components/password-input-field";
import { initialAuthState } from "@/features/auth/types";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialAuthState);
  const [timezone, setTimezone] = useState("UTC");

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  }, []);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input name="timezone" type="hidden" value={timezone} />
      <AuthMessage state={state} />
      <label className="block">
        <span className="text-sm font-semibold text-[#12352A]">First name</span>
        <span
          className={cn(
            "mt-2 flex min-h-12 items-center gap-3 rounded-md border border-[#DCE9E1] bg-white px-3.5 py-3 shadow-sm transition focus-within:border-[#55DCA4] focus-within:ring-4 focus-within:ring-[#55DCA4]/20",
            state.fieldErrors.displayName && "border-[#DE2624] focus-within:border-[#DE2624] focus-within:ring-[#DE2624]/15",
          )}
        >
          <UserRound aria-hidden="true" className="h-5 w-5 text-[#6A7E74]" strokeWidth={2} />
          <input
            aria-describedby={state.fieldErrors.displayName ? "signup-name-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors.displayName)}
            autoComplete="given-name"
            className="min-w-0 flex-1 bg-transparent text-[#12352A] outline-none placeholder:text-[#8CA096]"
            name="displayName"
            placeholder="Your first name"
            type="text"
          />
        </span>
        {state.fieldErrors.displayName ? (
          <span className="mt-2 block text-sm font-medium text-[#DE2624]" id="signup-name-error">
            {state.fieldErrors.displayName}
          </span>
        ) : null}
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-[#12352A]">Email</span>
        <span
          className={cn(
            "mt-2 flex min-h-12 items-center gap-3 rounded-md border border-[#DCE9E1] bg-white px-3.5 py-3 shadow-sm transition focus-within:border-[#55DCA4] focus-within:ring-4 focus-within:ring-[#55DCA4]/20",
            state.fieldErrors.email && "border-[#DE2624] focus-within:border-[#DE2624] focus-within:ring-[#DE2624]/15",
          )}
        >
          <Mail aria-hidden="true" className="h-5 w-5 text-[#6A7E74]" strokeWidth={2} />
          <input
            aria-describedby={state.fieldErrors.email ? "signup-email-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors.email)}
            autoComplete="email"
            className="min-w-0 flex-1 bg-transparent text-[#12352A] outline-none placeholder:text-[#8CA096]"
            name="email"
            placeholder="you@example.com"
            type="email"
          />
        </span>
        {state.fieldErrors.email ? (
          <span className="mt-2 block text-sm font-medium text-[#DE2624]" id="signup-email-error">
            {state.fieldErrors.email}
          </span>
        ) : null}
      </label>
      <PasswordInputField
        autoComplete="new-password"
        error={state.fieldErrors.password}
        errorId="signup-password-error"
        label="Password"
        name="password"
        placeholder="At least 8 characters"
      />
      <PasswordInputField
        autoComplete="new-password"
        error={state.fieldErrors.confirmPassword}
        errorId="signup-confirm-password-error"
        label="Confirm password"
        name="confirmPassword"
        placeholder="Repeat your password"
      />
      <AuthSubmitButton>Create account</AuthSubmitButton>
    </form>
  );
}
