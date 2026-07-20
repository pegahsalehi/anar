import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChartNoAxesColumnIncreasing, ShieldCheck, Timer } from "lucide-react";
import { AuthBrandLogo } from "@/components/layout/auth-brand-logo";
import { LegalFooter } from "@/components/legal/legal-footer";

const benefits: Array<{ title: string; icon: LucideIcon }> = [
  {
    title: "Your own food library",
    icon: ShieldCheck,
  },
  {
    title: "Faster everyday logging",
    icon: Timer,
  },
  {
    title: "Nutrition without the clutter",
    icon: ChartNoAxesColumnIncreasing,
  },
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-4 py-5 text-[#12352A] sm:px-8">
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-[url('/images/auth/anar-auth-background.png')] bg-cover bg-[position:76%_center] bg-no-repeat sm:bg-center"
      />
      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl flex-col">
        <div className="grid flex-1 items-center gap-8 py-7 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,28rem)] lg:gap-16">
          <section className="relative hidden min-h-[34rem] max-w-xl flex-col justify-center lg:flex">
            <h1 className="max-w-lg text-5xl font-semibold leading-[1.04] text-[#12352A]">
              Made for the meals you actually eat.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-[#51685D]">
              Save your everyday meals, homemade recipes, and local foods in one personal library.
              Add them once, then log them again in seconds.
            </p>
            <ul className="mt-10 grid gap-4">
              {benefits.map((benefit) => (
                <li className="flex items-center gap-3" key={benefit.title}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#DCE9E1] bg-white text-[#12352A] shadow-sm">
                    <benefit.icon aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="text-sm font-semibold text-[#12352A]">{benefit.title}</span>
                </li>
              ))}
            </ul>
          </section>
          <div className="relative mx-auto w-full max-w-md">
            <section
              aria-label="Authentication form"
              className="w-full overflow-hidden rounded-md border border-[#DCE9E1] bg-white p-6 shadow-[0_24px_70px_rgb(18_53_42_/_0.12)] sm:p-8"
            >
              <div className="relative z-10">
                <AuthBrandLogo />
                {children}
              </div>
            </section>
            <LegalFooter />
          </div>
        </div>
      </div>
    </main>
  );
}
