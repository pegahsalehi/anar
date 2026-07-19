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
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className={cn("text-sm font-medium text-muted-foreground", eyebrowClassName)}>
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold leading-10 text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
