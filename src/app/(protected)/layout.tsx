import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedRouteLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_path")
    .eq("id", user.id)
    .maybeSingle();
  const firstName = getFirstName(profile?.display_name);

  return (
    <AppShell
      user={{
        avatarPath: profile?.avatar_path ?? null,
        email: user.email ?? "",
        firstName,
      }}
    >
      {children}
    </AppShell>
  );
}

function getFirstName(displayName: string | null | undefined) {
  return displayName?.trim().split(/\s+/)[0] || null;
}
