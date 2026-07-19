import Link from "next/link";
import { AuthPageHeader } from "@/components/layout/auth-page-header";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata = {
  title: "Sign Up",
};

export default function SignupPage() {
  return (
    <section className="w-full">
      <AuthPageHeader
        title="Start with Anar"
        description="Create a private account and keep your food library separate from every other user."
      />
      <SignupForm />
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-medium text-primary hover:underline" href="/login">
          Log in
        </Link>
      </p>
    </section>
  );
}
