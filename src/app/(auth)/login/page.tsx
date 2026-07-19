import Link from "next/link";
import { AuthPageHeader } from "@/components/layout/auth-page-header";
import { LoginForm } from "@/features/auth/components/login-form";
import { getSafeRedirectPath } from "@/features/auth/redirects";

export const metadata = {
  title: "Log In",
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <section className="w-full">
      <AuthPageHeader
        title="Log in to Anar"
        description="See today's progress, manage your food library, and review your private nutrition history."
      />
      <LoginForm nextPath={getSafeRedirectPath(next)} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <Link className="font-medium text-primary hover:underline" href="/forgot-password">
          Forgot password?
        </Link>
        <Link className="font-medium text-primary hover:underline" href="/signup">
          Create account
        </Link>
      </div>
    </section>
  );
}
