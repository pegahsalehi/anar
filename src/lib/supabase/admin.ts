import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const preferredAdminKeyEnvVar = "SUPABASE_SECRET_KEY";
const fallbackAdminKeyEnvVar = "SUPABASE_SERVICE_ROLE_KEY";

export function createSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Supabase admin client can only be created on the server.");
  }

  const { secretKey, url } = getSupabaseAdminEnv();

  return createClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getSupabaseAdminEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = readEnvValue(preferredAdminKeyEnvVar) ?? readEnvValue(fallbackAdminKeyEnvVar);
  const missing = [
    !url ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !secretKey ? `${preferredAdminKeyEnvVar} or ${fallbackAdminKeyEnvVar}` : null,
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing Supabase admin environment variables: ${missing.join(", ")}`);
  }

  return {
    secretKey: secretKey as string,
    url: url as string,
  };
}

function readEnvValue(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}
