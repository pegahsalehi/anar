"use client";

import { useActionState, useEffect, useState } from "react";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { signupAction } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { initialAuthState } from "@/features/auth/types";

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
        <span className="text-sm font-medium text-foreground">Display name</span>
        <span className="mt-2 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-3">
          <UserRound aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          <input
            aria-describedby={state.fieldErrors.displayName ? "signup-name-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors.displayName)}
            autoComplete="name"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            name="displayName"
            placeholder="Alex"
            type="text"
          />
        </span>
        {state.fieldErrors.displayName ? (
          <span className="mt-2 block text-sm text-coral" id="signup-name-error">
            {state.fieldErrors.displayName}
          </span>
        ) : null}
      </label>
      <label className="block">
        <span className="text-sm font-medium text-foreground">Email</span>
        <span className="mt-2 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-3">
          <Mail aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          <input
            aria-describedby={state.fieldErrors.email ? "signup-email-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors.email)}
            autoComplete="email"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            name="email"
            placeholder="you@example.com"
            type="email"
          />
        </span>
        {state.fieldErrors.email ? (
          <span className="mt-2 block text-sm text-coral" id="signup-email-error">
            {state.fieldErrors.email}
          </span>
        ) : null}
      </label>
      <label className="block">
        <span className="text-sm font-medium text-foreground">Password</span>
        <span className="mt-2 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-3">
          <LockKeyhole aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          <input
            aria-describedby={state.fieldErrors.password ? "signup-password-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors.password)}
            autoComplete="new-password"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            name="password"
            placeholder="At least 8 characters"
            type="password"
          />
        </span>
        {state.fieldErrors.password ? (
          <span className="mt-2 block text-sm text-coral" id="signup-password-error">
            {state.fieldErrors.password}
          </span>
        ) : null}
      </label>
      <AuthSubmitButton>Create account</AuthSubmitButton>
    </form>
  );
}
