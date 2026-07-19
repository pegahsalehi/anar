import { normalizeAvatarId } from "@/features/profile/avatar-options";
import type { ProfilePageData } from "@/features/profile/types";
import { calculateLogDayStats } from "@/features/today/streaks";
import { getLocalISODate } from "@/lib/dates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "avatar_id" | "created_at" | "display_name" | "timezone"
>;

type LogDayRow = Pick<Database["public"]["Tables"]["food_logs"]["Row"], "local_log_date">;

const profileDataLoadError = "Profile data could not be loaded. Please try again.";

export async function getProfilePageData(): Promise<ProfilePageData> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      avatarId: "1",
      displayName: "User",
      email: "",
      memberSince: "",
      stats: {
        activeDays: 0,
        currentStreak: 0,
        foodsLogged: 0,
      },
      error: authError ? profileDataLoadError : "You must be signed in.",
    };
  }

  const [profileResult, logDaysResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("avatar_id, created_at, display_name, timezone")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("food_logs")
      .select("local_log_date", { count: "exact" })
      .eq("user_id", user.id)
      .order("local_log_date", { ascending: false })
      .limit(500),
  ]);

  const profile = profileResult.data as ProfileRow | null;
  const timezone = profile?.timezone ?? "UTC";
  const today = getLocalISODate(new Date(), timezone);
  const activeDates = ((logDaysResult.data ?? []) as LogDayRow[]).map(
    (log) => log.local_log_date,
  );
  const stats = calculateLogDayStats(activeDates, today);

  return {
    avatarId: normalizeAvatarId(profile?.avatar_id),
    displayName: getDisplayName(profile?.display_name, user.user_metadata?.display_name),
    email: user.email ?? "",
    memberSince: profile?.created_at ?? user.created_at ?? "",
    stats: {
      activeDays: stats.activeDays,
      currentStreak: stats.currentStreak,
      foodsLogged: logDaysResult.count ?? activeDates.length,
    },
    error: profileResult.error || logDaysResult.error ? profileDataLoadError : null,
  };
}

function getDisplayName(
  profileName: string | null | undefined,
  metadataName: unknown,
) {
  const storedName = profileName?.trim();

  if (storedName) {
    return storedName;
  }

  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  return "User";
}
