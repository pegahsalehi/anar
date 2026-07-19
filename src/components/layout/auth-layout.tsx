import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChartNoAxesColumnIncreasing, ShieldCheck, Timer } from "lucide-react";
import { AnarLogo } from "@/components/brand/anar-logo";
import {
  AuthCardSeedDecorations,
  AuthPageSeedDecorations,
} from "@/components/layout/auth-seed-decorations";

const benefits: Array<{ title: string; icon: LucideIcon }> = [
  {
    title: "Fast meal logging",
    icon: Timer,
  },
  {
    title: "Private nutrition history",
    icon: ShieldCheck,
  },
  {
    title: "Clear daily progress",
    icon: ChartNoAxesColumnIncreasing,
  },
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FBFDFB] px-4 py-5 text-[#12352A] sm:px-8">
      <AuthPageSeedDecorations />
      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl flex-col">
        <div className="grid flex-1 items-center gap-8 py-7 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,28rem)] lg:gap-16">
          <section className="relative hidden min-h-[34rem] max-w-xl flex-col justify-center lg:flex">
            <h1 className="max-w-lg text-5xl font-semibold leading-[1.04] text-[#12352A]">
              Small logs. Better habits.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-[#51685D]">
              Track your meals, understand your nutrition, and build healthier days one step at a
              time.
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
          <section
            aria-label="Authentication form"
            className="relative mx-auto w-full max-w-md overflow-hidden rounded-md border border-[#DCE9E1] bg-white p-6 shadow-[0_24px_70px_rgb(18_53_42_/_0.10)] sm:p-8"
          >
            <AuthCardSeedDecorations />
            <div className="relative z-10">
              <AnarLogo className="mb-8 w-full" href="/login" variant="auth" />
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
