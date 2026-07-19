"use client";

import { usePathname } from "next/navigation";
import { AnarLogo } from "@/components/brand/anar-logo";
import { cn } from "@/lib/utils";

export function AuthBrandLogo() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <AnarLogo
      className={cn("w-full", isLoginPage ? "mb-5 sm:mb-6" : "mb-8")}
      href="/login"
      imageClassName={
        isLoginPage
          ? "w-[104px] sm:w-[118px] md:w-[128px]"
          : undefined
      }
      imageSizes={
        isLoginPage
          ? "(min-width: 768px) 128px, (min-width: 640px) 118px, 104px"
          : undefined
      }
      variant="auth"
    />
  );
}
