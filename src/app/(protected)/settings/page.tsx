import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { legalLinks } from "@/content/legal-documents";
import { DailyNutritionTargetsForm } from "@/features/settings/components/daily-nutrition-targets-form";
import { SettingsAccordionCard } from "@/features/settings/components/settings-accordion-card";
import { getSettingsPageData } from "@/features/settings/queries";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const data = await getSettingsPageData();

  return (
    <div className="min-w-0 space-y-5 sm:space-y-7">
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

      <div className="grid gap-4 sm:gap-5">
        <DailyNutritionTargetsForm
          effectiveDate={data.effectiveDate}
          initialValues={data.dailyGoals}
        />
        <SettingsAccordionCard
          description="Learn how your data and nutrition totals are handled."
          summary="User-entered nutrition values, account-scoped data, and no medical advice."
          title="Privacy & nutrition information"
        >
          <div className="grid gap-2.5 text-sm leading-6 text-muted-foreground sm:gap-3">
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
      <section
        aria-labelledby="legal-privacy-title"
        className="rounded-md border border-border bg-card p-4 shadow-sm sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-base font-semibold text-card-foreground sm:text-lg" id="legal-privacy-title">
              Legal & privacy
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
              Review Anar&apos;s public legal documents.
            </p>
          </div>
          <nav
            aria-label="Legal and privacy documents"
            className="grid w-full grid-cols-3 gap-1.5 text-[0.7rem] font-semibold sm:w-auto sm:flex sm:flex-wrap sm:gap-2 sm:text-sm"
          >
            {legalLinks.map((link) => (
              <Link
                className="inline-flex min-h-9 items-center justify-center rounded-md border border-border px-2 py-1.5 text-center leading-4 text-foreground transition hover:bg-surface-soft hover:text-effective-badge-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:min-h-10 sm:px-3 sm:py-2 sm:leading-5"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
}
