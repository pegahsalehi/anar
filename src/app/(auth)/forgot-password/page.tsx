import Link from "next/link";
import { AuthPageHeader } from "@/components/layout/auth-page-header";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import type { AuthActionState } from "@/features/auth/types";

export const metadata = {
  title: "Reset Password",
};

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    auth_error?: string;
  }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { auth_error: authError } = await searchParams;
  const initialState = getInitialForgotPasswordState(authError);

  return (
    <section className="w-full">
      <AuthPageHeader
        title="Reset your password"
        description="Enter your account email and we'll send a recovery link if the account exists."
      />
      <ForgotPasswordForm initialState={initialState} />
      <Link className="mt-4 inline-flex text-sm font-medium text-[#102A43] underline-offset-4 hover:text-effective-badge-foreground hover:underline sm:mt-6" href="/login">
        Back to login
      </Link>
    </section>
  );
}

function getInitialForgotPasswordState(authError: string | undefined): AuthActionState | undefined {
  if (!authError) {
    return undefined;
  }

  return {
    status: "error",
    message: "That reset link is invalid or has expired. Request a new link to continue.",
    fieldErrors: {},
  };
}
