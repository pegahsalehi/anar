import Link from "next/link";
import { AuthPageHeader } from "@/components/layout/auth-page-header";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata = {
  title: "Reset Password",
};

export default function ForgotPasswordPage() {
  return (
    <section className="w-full">
      <AuthPageHeader
        title="Reset your password"
        description="Enter your account email and we'll send a recovery link if the account exists."
      />
      <ForgotPasswordForm />
      <Link className="mt-6 inline-flex text-sm font-medium text-primary hover:underline" href="/login">
        Back to login
      </Link>
    </section>
  );
}
