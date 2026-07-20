import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Supabase admin client can only be created on the server.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const missing = [
    !url ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !secretKey ? "SUPABASE_SECRET_KEY" : null,
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing Supabase admin environment variables: ${missing.join(", ")}`);
  }

  return createClient<Database>(url as string, secretKey as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
