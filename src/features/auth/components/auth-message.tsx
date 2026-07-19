import type { AuthActionState } from "@/features/auth/types";
import { cn } from "@/lib/utils";

type AuthMessageProps = {
  state: AuthActionState;
};

export function AuthMessage({ state }: AuthMessageProps) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-md px-3 py-2 text-sm leading-6",
        state.status === "success"
          ? "bg-fresh/12 text-fresh"
          : "bg-coral/10 text-coral",
      )}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}
