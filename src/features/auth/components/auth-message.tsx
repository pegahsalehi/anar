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
        "rounded-md border px-3.5 py-3 text-sm font-medium leading-6",
        state.status === "success"
          ? "border-[#55DCA4]/40 bg-[#55DCA4]/[0.14] text-[#12352A]"
          : "border-[#DE2624]/20 bg-[#DE2624]/[0.08] text-[#B51E1C]",
      )}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}
