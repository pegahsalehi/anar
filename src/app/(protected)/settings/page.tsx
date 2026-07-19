import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { ChangePasswordForm } from "@/features/settings/components/change-password-form";
import { DailyGoalRangesForm } from "@/features/settings/components/daily-goal-ranges-form";
import { getSettingsPageData } from "@/features/settings/queries";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const data = await getSettingsPageData();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Settings"
        description="Manage nutrition ranges, password access, and privacy notes."
      />

      {data.error ? (
        <p
          className="rounded-md border border-coral/25 bg-coral/10 px-4 py-3 text-sm text-coral"
          role="alert"
        >
          {data.error}
        </p>
      ) : null}

      <div className="grid gap-5">
        <DailyGoalRangesForm
          effectiveDate={data.effectiveDate}
          initialValues={data.dailyGoals}
        />
        <ChangePasswordForm />
      </div>

      <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/15 text-foreground">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">
                Privacy and health note
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-7 text-muted-foreground">
                Nutrition values are user-entered. Anar calculates totals and stores
                owner-scoped rows; it does not provide medical advice.
              </p>
            </div>
          </div>
          <div className="shrink-0 md:pt-1">
            <LogoutButton />
          </div>
        </div>
      </section>
    </div>
  );
}
