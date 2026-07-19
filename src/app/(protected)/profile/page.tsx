import { Clock, Mail, UserRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, timezone")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };
  const displayName = profile?.display_name || "Anar user";
  const email = user?.email || "No email available";
  const timezone = profile?.timezone || "UTC";

  return (
    <div className="space-y-7">
      <PageHeader
        title="Profile"
        description="Basic account details loaded from Supabase Auth and your private profile row."
      />
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-md bg-muted text-primary">
            <UserRound aria-hidden="true" className="h-9 w-9" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">{displayName}</h2>
            <dl className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <div className="flex min-w-0 items-center gap-2">
                <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />
                <dt className="sr-only">Email</dt>
                <dd className="truncate">{email}</dd>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <Clock aria-hidden="true" className="h-4 w-4 shrink-0" />
                <dt className="sr-only">Timezone</dt>
                <dd className="truncate">{timezone}</dd>
              </div>
            </dl>
          </div>
          <span className="inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground">
            Profile editing coming later
          </span>
        </div>
      </section>
    </div>
  );
}
