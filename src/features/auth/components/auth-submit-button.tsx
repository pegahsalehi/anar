"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type AuthSubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthSubmitButton({ children, className }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-disabled={pending}
      className={cn(
        "min-h-12 w-full rounded-md bg-[#55DCA4] px-4 py-3 text-sm font-semibold text-[#12352A] shadow-[0_14px_28px_rgb(18_53_42_/_0.12)] transition hover:bg-[#49C995] focus-visible:ring-4 focus-visible:ring-[#55DCA4]/25 active:bg-[#38B982] disabled:cursor-wait disabled:opacity-70",
        className,
      )}
      disabled={pending}
      type="submit"
    >
      {pending ? "Working..." : children}
    </button>
  );
}
