"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { LogOut, Settings, UserRound } from "lucide-react";
import type { AppShellUser } from "@/components/layout/app-shell";
import { UserAvatar } from "@/components/user/user-avatar";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

type ProfileMenuProps = {
  user: AppShellUser;
};

const menuItems = [
  {
    href: "/profile",
    icon: UserRound,
    label: "View profile",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
  },
];

export function ProfileMenu({ user }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>([]);
  const label = `Hi, ${user.displayName || "User"}`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function focusItem(index: number) {
    const items = itemRefs.current.filter(Boolean);
    const nextItem = items[(index + items.length) % items.length];
    nextItem?.focus();
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(true);
      window.requestAnimationFrame(() => focusItem(0));
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = itemRefs.current.filter(Boolean);
    const currentIndex = items.findIndex((item) => item === document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(currentIndex + 1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(currentIndex - 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      focusItem(items.length - 1);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="inline-flex min-h-11 items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold shadow-sm transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleButtonKeyDown}
        type="button"
      >
        <UserAvatar avatarId={user.avatarId} size="sm" />
        <span className="hidden max-w-44 truncate sm:inline">{label}</span>
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-border bg-card p-1.5 shadow-soft"
          onKeyDown={handleMenuKeyDown}
          role="menu"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-semibold text-foreground">{user.displayName}</p>
            {user.email ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
            ) : null}
          </div>

          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "mt-1 flex min-h-10 items-center gap-2 rounded-sm px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-surface-soft hover:text-foreground",
                )}
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                role="menuitem"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          <form action={logoutAction} className="mt-1">
            <button
              className="flex min-h-10 w-full items-center gap-2 rounded-sm px-3 text-left text-sm font-semibold text-muted-foreground transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              ref={(node) => {
                itemRefs.current[menuItems.length] = node;
              }}
              role="menuitem"
              type="submit"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Log out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
