import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  eyebrowClassName?: string;
  action?: ReactNode;
  compactMobile?: boolean;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  eyebrowClassName,
  action,
  compactMobile = false,
}: PageHeaderProps) {
  return (
    <header className={cn("flex min-w-0 flex-col sm:flex-row sm:items-end sm:justify-between sm:gap-4", compactMobile ? "gap-2.5" : "gap-3")}>
      <div className="flex min-w-0 items-start justify-between gap-3 sm:block">
        <div className="min-w-0">
          {eyebrow ? (
            <p className={cn("text-xs font-medium text-muted-foreground sm:text-sm", eyebrowClassName)}>
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={cn(
              "mt-0.5 font-semibold text-foreground sm:mt-1 sm:text-3xl sm:leading-10",
              compactMobile ? "text-[1.5rem] leading-7" : "text-[1.65rem] leading-8",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={cn(
                "max-w-2xl text-muted-foreground sm:mt-2 sm:text-sm sm:leading-7",
                compactMobile ? "mt-1 text-[0.8rem] leading-5" : "mt-1.5 text-sm leading-6",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 sm:hidden">{action}</div> : null}
      </div>
      {action ? <div className="hidden shrink-0 sm:block">{action}</div> : null}
    </header>
  );
}
