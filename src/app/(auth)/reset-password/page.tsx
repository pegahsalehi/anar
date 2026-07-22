import { AuthPageHeader } from "@/components/layout/auth-page-header";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import type { AuthActionState } from "@/features/auth/types";

export const metadata = {
  title: "New Password",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    auth_error?: string;
    auth_status?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { auth_error: authError, auth_status: authStatus } = await searchParams;
  const initialState = getInitialResetPasswordState({ authError, authStatus });

  return (
    <section className="w-full">
      <AuthPageHeader
        title="Choose a new password"
        description="Enter a fresh password for your account."
      />
      <ResetPasswordForm initialState={initialState} />
    </section>
  );
}

function getInitialResetPasswordState({
  authError,
  authStatus,
}: {
  authError?: string;
  authStatus?: string;
}): AuthActionState | undefined {
  if (authStatus === "password_reset_ready") {
    return {
      status: "success",
      message: "Your reset link was confirmed. Choose a new password to finish.",
      fieldErrors: {},
    };
  }

  if (!authError) {
    return undefined;
  }

  return {
    status: "error",
    message: "That reset link is invalid or has expired. Request a new link to continue.",
    fieldErrors: {},
  };
}
