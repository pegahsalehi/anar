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
        "min-h-12 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#59CF95] active:bg-[#3FBD7E] disabled:cursor-wait disabled:opacity-70",
        className,
      )}
      disabled={pending}
      type="submit"
    >
      {pending ? "Working..." : children}
    </button>
  );
}
