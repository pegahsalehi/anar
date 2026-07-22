import { redirect } from "next/navigation";
import { PublicLandingPage } from "@/components/landing/public-landing-page";
import { getSafeRedirectPath } from "@/features/auth/redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/today");
  }

  const { next } = await searchParams;

  return <PublicLandingPage nextPath={getSafeRedirectPath(next)} />;
}
