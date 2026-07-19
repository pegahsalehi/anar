import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { AnarLogo } from "@/components/brand/anar-logo";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, actionLabel, action }: EmptyStateProps) {
  return (
    <section className="rounded-md border border-dashed border-border bg-card p-6 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-muted">
        <AnarLogo compact decorative href={null} />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-card-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
      {!action && actionLabel ? (
        <button
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-[#49C995] active:bg-[#38B982]"
          type="button"
        >
          <Plus aria-hidden="true" className="h-5 w-5" />
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
