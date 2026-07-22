import type { CSSProperties } from "react";
import Link from "next/link";
import { ChartNoAxesColumnIncreasing, ShieldCheck, Timer, type LucideIcon } from "lucide-react";
import { AnarLogo } from "@/components/brand/anar-logo";

export const landingBackgrounds = {
  mobile: "/icons/pwa/first-page-mobile.png",
  desktop: "/images/auth/first-page-desktop.png",
};

const desktopFeatures: Array<{ title: string; icon: LucideIcon }> = [
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

type PublicLandingPageProps = {
  nextPath?: string;
};

export function PublicLandingPage({ nextPath = "/today" }: PublicLandingPageProps) {
  const loginHref = getLoginHref(nextPath);
  const backgroundStyle = {
    "--landing-mobile-background": `url("${landingBackgrounds.mobile}")`,
    "--landing-desktop-background": `url("${landingBackgrounds.desktop}")`,
  } as CSSProperties;

  return (
    <main
      className="relative isolate min-h-screen overflow-x-hidden bg-[#FFFCF7] bg-[image:var(--landing-mobile-background)] bg-cover bg-center bg-no-repeat text-[#12352A] lg:bg-[image:var(--landing-desktop-background)]"
      data-desktop-background={landingBackgrounds.desktop}
      data-mobile-background={landingBackgrounds.mobile}
      data-testid="public-landing-page"
      style={backgroundStyle}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#FFFCF7]/0 via-[#FFFCF7]/10 to-[#FFFCF7]/35 lg:bg-gradient-to-r lg:from-[#FFFCF7]/45 lg:via-[#FFFCF7]/10 lg:to-transparent"
      />
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 lg:px-10">
        <header className="flex shrink-0 items-center justify-between">
          <AnarLogo
            className="w-auto"
            href="/"
            imageClassName="w-[104px] sm:w-[122px]"
            imageSizes="(min-width: 640px) 122px, 104px"
            variant="nav"
          />
        </header>
        <section
          aria-labelledby="landing-heading"
          className="relative flex flex-1 items-end pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 sm:pb-10 lg:items-center lg:pb-16 lg:pt-16"
          data-testid="landing-overlay"
        >
          <div className="w-full max-w-sm min-w-0 text-left sm:max-w-md lg:max-w-[29rem]">
            <div className="absolute left-1/2 top-[clamp(12rem,38svh,18rem)] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4 text-center sm:static sm:max-w-none sm:translate-x-0 sm:translate-y-0 sm:px-0 lg:mx-0 lg:text-left">
              <h1
                className="text-balance text-3xl font-semibold leading-tight text-[#12352A] sm:text-4xl lg:text-5xl lg:leading-[1.04]"
                id="landing-heading"
              >
                <span className="block lg:inline">Made for the meals</span>{" "}
                <span className="block lg:inline">you actually eat.</span>
              </h1>
              <p className="mt-3 text-sm font-medium text-[#12352A] lg:hidden">
                Personal nutrition-tracking app
              </p>
            </div>
            <p className="mt-6 hidden max-w-md text-lg leading-8 text-[#51685D] lg:block">
              Save your everyday meals, homemade recipes, and local foods in one personal library.
              Add them once, then log them again in seconds.
            </p>
            <ul className="mt-10 hidden gap-4 lg:grid">
              {desktopFeatures.map((feature) => (
                <li className="flex items-center gap-3" key={feature.title}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#DCE9E1] bg-white text-[#12352A] shadow-sm">
                    <feature.icon aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="text-sm font-semibold text-[#12352A]">{feature.title}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 grid w-full gap-3 sm:mx-auto sm:max-w-sm sm:grid-cols-2 lg:mx-0 lg:mt-10">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#55DCA4] px-4 py-2.5 text-sm font-semibold text-[#12352A] shadow-[0_14px_28px_rgb(18_53_42_/_0.12)] transition hover:bg-[#49C995] focus-visible:ring-4 focus-visible:ring-[#55DCA4]/25 active:bg-[#38B982] sm:min-h-12 sm:py-3"
                href={loginHref}
              >
                Log in
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#C9D8D0] bg-white px-4 py-2.5 text-sm font-semibold text-[#12352A] shadow-sm transition hover:border-[#55DCA4] hover:text-[#2E9F6D] focus-visible:ring-4 focus-visible:ring-[#55DCA4]/20 active:bg-[#F7F8F6] sm:min-h-12 sm:py-3"
                href="/signup"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function getLoginHref(nextPath: string) {
  if (nextPath === "/today") {
    return "/login";
  }

  const searchParams = new URLSearchParams({ next: nextPath });
  return `/login?${searchParams.toString()}`;
}
