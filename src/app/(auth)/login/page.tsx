import Link from "next/link";
import { AuthPageHeader } from "@/components/layout/auth-page-header";
import { LoginForm } from "@/features/auth/components/login-form";
import { getSafeRedirectPath } from "@/features/auth/redirects";

export const metadata = {
  title: "Log In",
};

type LoginPageProps = {
  searchParams: Promise<{
    deleted?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { deleted, next } = await searchParams;
  const initialState =
    deleted === "1"
      ? {
          status: "success" as const,
          message: "Your account has been permanently deleted.",
          fieldErrors: {},
        }
      : undefined;

  return (
    <section className="w-full">
      <AuthPageHeader
        title="Welcome back"
        description="Log in to continue tracking your daily nutrition."
      />
      <LoginForm initialState={initialState} nextPath={getSafeRedirectPath(next)} />
      <div className="mt-4 flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs text-[#51685D] sm:mt-6 sm:text-sm">
        <Link
          className="font-semibold text-[#12352A] underline-offset-4 hover:text-[#2E9F6D] hover:underline focus-visible:rounded-sm"
          href="/forgot-password"
        >
          Forgot password?
        </Link>
        <Link
          className="font-semibold text-[#12352A] underline-offset-4 hover:text-[#2E9F6D] hover:underline focus-visible:rounded-sm"
          href="/signup"
        >
          New to Anar? Create a free account
        </Link>
      </div>
    </section>
  );
}
