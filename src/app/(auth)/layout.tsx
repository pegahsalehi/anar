import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AuthRouteLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/today");
  }

  return <AuthLayout>{children}</AuthLayout>;
}
