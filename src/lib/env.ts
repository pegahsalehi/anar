type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export function getSupabasePublicEnv(): SupabasePublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing = [
    !url ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !anonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing Supabase environment variables: ${missing.join(", ")}`);
  }

  return { url: url as string, anonKey: anonKey as string };
}
