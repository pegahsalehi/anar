"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnarLogo } from "@/components/brand/anar-logo";
import { NavIcon } from "@/components/navigation/nav-icon";
import { appNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileNavigationDrawer() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function openDrawer() {
    setIsOpen(true);
  }

  function closeDrawer() {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function handleDrawerKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") {
      return;
    }

    const focusableItems = Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    ).filter((element) => !element.hasAttribute("disabled"));
    const firstItem = focusableItems[0];
    const lastItem = focusableItems.at(-1);

    if (!firstItem || !lastItem) {
      return;
    }

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  }

  const drawer = (
    <div
      aria-hidden={!isOpen}
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <button
        aria-label="Close navigation menu"
        className={cn(
          "absolute inset-0 h-full w-full bg-foreground/24 backdrop-blur-[2px] transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={closeDrawer}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />
      <div
        aria-labelledby="mobile-navigation-title"
        aria-modal="true"
        className={cn(
          "absolute bottom-0 left-0 top-0 flex w-[min(20rem,calc(100vw-2.5rem))] flex-col border-r border-border bg-background-alt px-5 pb-6 pt-[max(env(safe-area-inset-top),1rem)] shadow-soft transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        onKeyDown={handleDrawerKeyDown}
        ref={drawerRef}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <AnarLogo href={null} imageClassName="w-[128px]" imageSizes="128px" />
            <h2 className="sr-only" id="mobile-navigation-title">
              Navigation menu
            </h2>
          </div>
          <button
            aria-label="Close navigation menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={closeDrawer}
            ref={closeButtonRef}
            tabIndex={isOpen ? 0 : -1}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="mt-8">
          <ul className="space-y-2">
            {appNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted-foreground transition hover:bg-[#55DCA4]/15 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isActive && "bg-[#55DCA4] text-foreground hover:bg-[#55DCA4]",
                    )}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    tabIndex={isOpen ? 0 : -1}
                  >
                    <NavIcon className="h-5 w-5" icon={item.icon} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Open navigation menu"
        className="inline-flex min-h-11 max-w-[9.75rem] shrink-0 items-center gap-2 rounded-md px-1 py-1 text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
        onClick={openDrawer}
        ref={triggerRef}
        type="button"
      >
        <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={2.1} />
      </button>
      {isMounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
