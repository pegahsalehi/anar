"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnarLogo } from "@/components/brand/anar-logo";
import { NavIcon } from "@/components/navigation/nav-icon";
import { appNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 left-0 top-0 hidden w-72 border-r border-border bg-background-alt px-5 py-6 lg:block">
      <AnarLogo />
      <nav aria-label="Primary navigation" className="mt-9">
        <ul className="space-y-2">
          {appNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted-foreground transition hover:bg-[#55DCA4]/15 hover:text-foreground",
                    isActive && "bg-[#55DCA4] text-foreground hover:bg-[#55DCA4]",
                  )}
                  href={item.href}
                >
                  <NavIcon className="h-5 w-5" icon={item.icon} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
