"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsAccordionCardProps = {
  title: string;
  description: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function SettingsAccordionCard({
  title,
  description,
  summary,
  defaultOpen = false,
  children,
}: SettingsAccordionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:px-6"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="min-w-0">
          <span className="block text-lg font-semibold text-card-foreground">{title}</span>
          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
            {description}
          </span>
          {summary && !isOpen ? (
            <span className="mt-2 block text-xs font-medium leading-5 text-foreground">
              {summary}
            </span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180 text-foreground",
          )}
          strokeWidth={2}
        />
      </button>
      <div
        aria-hidden={!isOpen}
        className={cn(
          "grid transition-all duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        id={panelId}
        inert={!isOpen}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
