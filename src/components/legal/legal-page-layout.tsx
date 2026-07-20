import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnarLogo } from "@/components/brand/anar-logo";

type LegalPageLayoutProps = {
  children: ReactNode;
  subtitle: string;
  title: string;
};

export function LegalPageLayout({ children, subtitle, title }: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[820px]">
        <header className="py-5 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <AnarLogo
              href="/"
              imageClassName="w-[104px] sm:w-[118px]"
              imageSizes="118px"
              variant="nav"
            />
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              href="/"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              Back to Anar
            </Link>
          </div>
          <div className="mt-10 border-b border-border pb-7">
            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
