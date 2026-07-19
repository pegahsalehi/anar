import Link from "next/link";
import Image from "next/image";
import type { AppShellUser } from "@/components/layout/app-shell";

type ProfileMenuProps = {
  user: AppShellUser;
};

export function ProfileMenu({ user }: ProfileMenuProps) {
  const label = user.firstName ? `Hi, ${user.firstName}` : "Hi there";

  return (
    <Link
      className="inline-flex min-h-11 items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold shadow-sm transition hover:border-primary/40"
      href="/profile"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/50 bg-primary/10 shadow-[0_6px_14px_rgb(85_220_164_/_0.16)]">
        <Image
          alt="Anar user avatar"
          className="h-full w-full object-cover object-center"
          height={36}
          src="/images/avatar/anar-avatar.png"
          width={36}
        />
      </span>
      <span className="hidden max-w-44 truncate sm:inline">{label}</span>
    </Link>
  );
}
