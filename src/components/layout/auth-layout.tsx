import type { ReactNode } from "react";
import { AnarLogo } from "@/components/brand/anar-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-end">
          <ThemeToggle />
        </header>
        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_28rem]">
          <section className="hidden max-w-xl lg:block">
            <AnarLogo />
            <h1 className="mt-4 max-w-lg text-4xl font-black leading-[1.25] text-foreground">
              Log meals, review days, and keep daily nutrition calm and private.
            </h1>
            <p className="mt-5 max-w-md text-base leading-8 text-muted-foreground">
              Anar is built for fast gram-based food logging, reusable foods, and
              owner-scoped data backed by Supabase.
            </p>
          </section>
          <section className="mx-auto w-full max-w-md rounded-md border border-border bg-card p-5 shadow-soft sm:p-7">
            <AnarLogo className="mb-7 w-full" variant="auth" />
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
