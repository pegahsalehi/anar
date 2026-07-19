"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/navigation/nav-icon";
import { appNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/96 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-soft backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        {appNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 text-xs font-semibold text-muted-foreground transition",
                  isActive && "bg-muted text-primary",
                )}
                href={item.href}
              >
                <NavIcon className="h-5 w-5" icon={item.icon} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
