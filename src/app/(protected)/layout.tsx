import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { normalizeAvatarId } from "@/features/profile/avatar-options";
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
    .select("display_name, avatar_id")
    .eq("id", user.id)
    .maybeSingle();
  const displayName = getDisplayName(
    profile?.display_name,
    user.user_metadata?.display_name,
  );

  return (
    <AppShell
      user={{
        avatarId: normalizeAvatarId(profile?.avatar_id),
        displayName,
        email: user.email ?? "",
      }}
    >
      {children}
    </AppShell>
  );
}

function getDisplayName(
  profileName: string | null | undefined,
  metadataName: unknown,
) {
  const storedName = profileName?.trim();

  if (storedName) {
    return storedName;
  }

  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  return "User";
}
