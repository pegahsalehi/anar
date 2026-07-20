import Link from "next/link";
import { legalLinks } from "@/content/legal-documents";

export function LegalFooter() {
  return (
    <nav
      aria-label="Legal links"
      className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-xs font-medium text-[#6A7E74]"
    >
      {legalLinks.map((link, index) => (
        <span className="inline-flex items-center gap-2" key={link.href}>
          {index > 0 ? <span aria-hidden="true">·</span> : null}
          <Link
            className="rounded-sm underline-offset-4 transition hover:text-[#12352A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55DCA4]/45"
            href={link.href}
          >
            {link.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
