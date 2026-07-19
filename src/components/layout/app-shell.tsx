import type { ReactNode } from "react";
import { AnarLogo } from "@/components/brand/anar-logo";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";
import { DesktopSidebar } from "@/components/navigation/desktop-sidebar";
import { ProfileMenu } from "@/components/navigation/profile-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export type AppShellUser = {
  avatarPath: string | null;
  displayName: string | null;
  email: string;
};

type AppShellProps = {
  children: ReactNode;
  user: AppShellUser;
};

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DesktopSidebar />
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/92 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <AnarLogo className="lg:hidden" compact />
            <ProfileMenu user={user} />
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}
