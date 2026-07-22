import { AnarLogo } from "@/components/brand/anar-logo";

export function AuthBrandLogo() {
  return (
    <AnarLogo
      className="mb-4 w-full sm:mb-6"
      href="/login"
      imageClassName="w-[96px] sm:w-[118px] md:w-[128px]"
      imageSizes="(min-width: 768px) 128px, (min-width: 640px) 118px, 96px"
      variant="auth"
    />
  );
}
