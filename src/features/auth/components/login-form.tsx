"use client";

import { useActionState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { loginAction } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { initialAuthState } from "@/features/auth/types";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialAuthState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input name="next" type="hidden" value={nextPath} />
      <AuthMessage state={state} />
      <label className="block">
        <span className="text-sm font-medium text-foreground">Email</span>
        <span className="mt-2 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-3">
          <Mail aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          <input
            aria-describedby={state.fieldErrors.email ? "login-email-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors.email)}
            autoComplete="email"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            name="email"
            placeholder="you@example.com"
            type="email"
          />
        </span>
        {state.fieldErrors.email ? (
          <span className="mt-2 block text-sm text-coral" id="login-email-error">
            {state.fieldErrors.email}
          </span>
        ) : null}
      </label>
      <label className="block">
        <span className="text-sm font-medium text-foreground">Password</span>
        <span className="mt-2 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-3">
          <LockKeyhole aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          <input
            aria-describedby={state.fieldErrors.password ? "login-password-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors.password)}
            autoComplete="current-password"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            name="password"
            placeholder="Your password"
            type="password"
          />
        </span>
        {state.fieldErrors.password ? (
          <span className="mt-2 block text-sm text-coral" id="login-password-error">
            {state.fieldErrors.password}
          </span>
        ) : null}
      </label>
      <AuthSubmitButton>Log in</AuthSubmitButton>
    </form>
  );
}
