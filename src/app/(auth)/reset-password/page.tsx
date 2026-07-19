import { AuthPageHeader } from "@/components/layout/auth-page-header";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata = {
  title: "New Password",
};

export default function ResetPasswordPage() {
  return (
    <section className="w-full">
      <AuthPageHeader
        title="Choose a new password"
        description="Enter a fresh password for your account."
      />
      <ResetPasswordForm />
    </section>
  );
}
