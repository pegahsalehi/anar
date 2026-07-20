import Link from "next/link";
import { legalLinks } from "@/content/legal-documents";

export function LegalFooter() {
  return (
    <nav
      aria-label="Legal links"
      className="mt-4 grid grid-cols-3 gap-1.5 text-center text-[0.68rem] font-semibold text-[#6A7E74] sm:mt-5 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-2 sm:text-xs"
    >
      {legalLinks.map((link) => (
        <span className="min-w-0" key={link.href}>
          <Link
            className="inline-flex min-h-8 items-center justify-center rounded-sm px-1 leading-4 underline-offset-4 transition hover:text-[#12352A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55DCA4]/45 sm:min-h-0 sm:px-0"
            href={link.href}
          >
            {link.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
