"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { loginAction } from "@/features/auth/actions";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { PasswordInputField } from "@/features/auth/components/password-input-field";
import { initialAuthState, type AuthActionState } from "@/features/auth/types";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  initialState?: AuthActionState;
  nextPath: string;
};

export function LoginForm({ initialState, nextPath }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState ?? initialAuthState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input name="next" type="hidden" value={nextPath} />
      <AuthMessage state={state} />
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
            aria-describedby={state.fieldErrors.email ? "login-email-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors.email)}
            autoComplete="email"
            className="min-w-0 flex-1 bg-transparent text-[#12352A] outline-none placeholder:text-[#8CA096]"
            name="email"
            placeholder="you@example.com"
            type="email"
          />
        </span>
        {state.fieldErrors.email ? (
          <span className="mt-2 block text-sm font-medium text-[#DE2624]" id="login-email-error">
            {state.fieldErrors.email}
          </span>
        ) : null}
      </label>
      <PasswordInputField
        autoComplete="current-password"
        error={state.fieldErrors.password}
        errorId="login-password-error"
        label="Password"
        name="password"
        placeholder="Your password"
      />
      <AuthSubmitButton>Log in</AuthSubmitButton>
    </form>
  );
}
