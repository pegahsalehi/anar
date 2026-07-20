import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  eyebrowClassName?: string;
  action?: ReactNode;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  eyebrowClassName,
  action,
}: PageHeaderProps) {
  return (
    <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="flex min-w-0 items-start justify-between gap-3 sm:block">
        <div className="min-w-0">
          {eyebrow ? (
            <p className={cn("text-xs font-medium text-muted-foreground sm:text-sm", eyebrowClassName)}>
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-0.5 text-[1.65rem] font-semibold leading-8 text-foreground sm:mt-1 sm:text-3xl sm:leading-10">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-2 sm:leading-7">
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
