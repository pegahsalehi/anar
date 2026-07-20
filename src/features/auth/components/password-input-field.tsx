"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputFieldProps = {
  autoComplete: string;
  error?: string;
  errorId: string;
  label: string;
  name: string;
  placeholder: string;
};

export function PasswordInputField({
  autoComplete,
  error,
  errorId,
  label,
  name,
  placeholder,
}: PasswordInputFieldProps) {
  const inputId = useId();
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <div className="block">
      <label className="text-sm font-semibold text-[#12352A]" htmlFor={inputId}>
        {label}
      </label>
      <span
        className={cn(
          "mt-1.5 flex min-h-11 items-center gap-2.5 rounded-md border border-[#DCE9E1] bg-white px-3 py-2.5 shadow-sm transition focus-within:border-[#55DCA4] focus-within:ring-4 focus-within:ring-[#55DCA4]/20 sm:mt-2 sm:min-h-12 sm:gap-3 sm:px-3.5 sm:py-3",
          error && "border-[#DE2624] focus-within:border-[#DE2624] focus-within:ring-[#DE2624]/15",
        )}
      >
        <LockKeyhole
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-[#6A7E74]"
          strokeWidth={2}
        />
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent text-[#12352A] outline-none placeholder:text-[#8CA096]"
          id={inputId}
          name={name}
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
        />
        <button
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-[#6A7E74] transition hover:text-[#12352A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55DCA4]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
        </button>
      </span>
      {error ? (
        <span className="mt-2 block text-sm font-medium text-[#DE2624]" id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
