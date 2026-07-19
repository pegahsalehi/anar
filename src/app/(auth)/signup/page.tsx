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
        title="Create your Anar account"
        description="Start tracking your meals and daily nutrition in just a few steps."
      />
      <SignupForm />
      <p className="mt-6 text-sm text-[#51685D]">
        Already have an account?{" "}
        <Link
          className="font-semibold text-[#12352A] underline-offset-4 hover:text-[#2E9F6D] hover:underline focus-visible:rounded-sm"
          href="/login"
        >
          Log in
        </Link>
      </p>
    </section>
  );
}
