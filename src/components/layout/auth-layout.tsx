import type { ReactNode } from "react";
import { AuthBrandLogo } from "@/components/layout/auth-brand-logo";
import { LegalFooter } from "@/components/legal/legal-footer";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#FFFCF7] px-4 py-3 text-[#12352A] sm:px-8 sm:py-5 lg:bg-white">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-[#E8FFF4] to-[#FFFCF7]/0 lg:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 left-1/2 z-0 h-48 w-[140%] -translate-x-1/2 rounded-[50%] border-t border-[#55DCA4]/25 lg:hidden"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 hidden bg-[url('/images/auth/anar-auth-background.png')] bg-cover bg-center bg-no-repeat lg:block"
      />
      <div className="relative mx-auto flex min-h-[calc(100svh-1.5rem)] w-full max-w-md flex-col justify-center py-4 sm:min-h-[calc(100vh-2.5rem)] sm:py-10">
        <section
          aria-label="Authentication form"
          className="w-full overflow-hidden rounded-md border border-[#DCE9E1] bg-white p-5 shadow-[0_18px_52px_rgb(18_53_42_/_0.12)] sm:p-8 sm:shadow-[0_24px_70px_rgb(18_53_42_/_0.12)]"
        >
          <div className="relative z-10">
            <AuthBrandLogo />
            {children}
          </div>
        </section>
        <LegalFooter />
      </div>
    </main>
  );
}
