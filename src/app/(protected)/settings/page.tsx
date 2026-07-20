import { PageHeader } from "@/components/layout/page-header";
import { DailyNutritionTargetsForm } from "@/features/settings/components/daily-nutrition-targets-form";
import { SettingsAccordionCard } from "@/features/settings/components/settings-accordion-card";
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
        description="Manage nutrition targets and privacy."
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
        <DailyNutritionTargetsForm
          effectiveDate={data.effectiveDate}
          initialValues={data.dailyGoals}
        />
        <SettingsAccordionCard
          description="Learn how your data and nutrition totals are handled."
          summary="User-entered nutrition values, account-scoped data, and no medical advice."
          title="Privacy & nutrition information"
        >
          <div className="grid gap-3 text-sm leading-6 text-muted-foreground">
            <p>
              Nutrition values are entered by you. Anar calculates totals from
              those user-entered values.
            </p>
            <p>
              Your foods, logs, and targets are scoped to your authenticated
              account.
            </p>
            <p>
              Anar helps with tracking and does not provide medical advice.
            </p>
          </div>
        </SettingsAccordionCard>
      </div>
    </div>
  );
}
