import Link from "next/link";
import { UserRound } from "lucide-react";
import type { AppShellUser } from "@/components/layout/app-shell";

type ProfileMenuProps = {
  user: AppShellUser;
};

export function ProfileMenu({ user }: ProfileMenuProps) {
  const label = user.displayName || user.email || "Anar user";

  return (
    <Link
      className="inline-flex min-h-11 items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold shadow-sm transition hover:border-primary/40"
      href="/profile"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-primary">
        <UserRound aria-hidden="true" className="h-4 w-4" />
      </span>
      <span className="hidden max-w-44 truncate sm:inline">{label}</span>
    </Link>
  );
}
