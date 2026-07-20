import type { ReactNode } from "react";
import { getAppShellGreeting } from "@/components/layout/app-shell-greeting";
import { DesktopSidebar } from "@/components/navigation/desktop-sidebar";
import { MobileNavigationDrawer } from "@/components/navigation/mobile-navigation-drawer";
import { ProfileMenu } from "@/components/navigation/profile-menu";

export type AppShellUser = {
  avatarId: string;
  displayName: string;
  email: string;
};

type AppShellProps = {
  children: ReactNode;
  user: AppShellUser;
};

export function AppShell({ children, user }: AppShellProps) {
  const greeting = getAppShellGreeting(user);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DesktopSidebar />
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/92 px-4 py-2.5 backdrop-blur sm:px-6 sm:py-3 lg:px-8">
          <div className="mx-auto flex min-h-12 max-w-6xl items-center gap-2 sm:gap-4">
            <MobileNavigationDrawer />
            <p className="ml-auto min-w-0 max-w-[8.5rem] truncate text-sm font-semibold text-foreground sm:max-w-[14rem] lg:hidden">
              {greeting}
            </p>
            <div className="shrink-0">
              <ProfileMenu user={user} />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-4 sm:px-6 sm:pt-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
