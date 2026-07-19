import { BellRing, KeyRound, Palette, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LogoutButton } from "@/features/auth/components/logout-button";

export const metadata = {
  title: "Settings",
};

const settingsItems = [
  {
    icon: Palette,
    title: "Appearance",
    description: "Switch between light and dark mode on this device.",
    control: <ThemeToggle />,
  },
  {
    icon: BellRing,
    title: "Daily goals",
    description: "Goal rows are stored per user in Supabase. Editing controls are not built yet.",
    control: <span className="text-sm font-semibold text-muted-foreground">Read-only</span>,
  },
  {
    icon: KeyRound,
    title: "Password",
    description: "Password recovery is handled through Supabase Auth email links.",
    control: <span className="text-sm font-semibold text-muted-foreground">Auth-backed</span>,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        title="Settings"
        description="Account preferences, daily goal status, and privacy notes."
      />
      <div className="grid gap-3">
        {settingsItems.map((item) => (
          <section
            className="flex flex-col gap-4 rounded-md border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            key={item.title}
          >
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                <item.icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            </div>
            {item.control}
          </section>
        ))}
      </div>
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted text-fresh">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold">Privacy and health note</h2>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">
              Nutrition values are user-entered. Anar calculates totals and stores owner-scoped
              rows; it does not provide medical advice.
            </p>
          </div>
        </div>
      </section>
      <LogoutButton />
    </div>
  );
}
