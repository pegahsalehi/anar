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
    <section className="min-w-0 overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:gap-4 sm:px-6 sm:py-4"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="min-w-0">
          <span className="block text-base font-semibold text-card-foreground sm:text-lg">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
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
            "mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 sm:mt-1",
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
          <div className="border-t border-border px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
