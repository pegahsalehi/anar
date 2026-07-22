"use server";

import { isISODate } from "@/lib/dates";
import { formatGram } from "@/lib/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type FoodLogRow = Pick<
  Database["public"]["Tables"]["food_logs"]["Row"],
  "id" | "food_name_snapshot" | "consumed_grams" | "logged_at" | "local_log_date" | "user_id"
>;

export type HistoryDayLogItem = {
  id: string;
  foodName: string;
  grams: number;
  gramLabel: string;
  loggedAt: string;
};

export type HistoryDayDetailsResult = {
  date: string;
  logs: HistoryDayLogItem[];
  error: string | null;
};

export async function getHistoryDayDetailsAction(
  date: string,
): Promise<HistoryDayDetailsResult> {
  if (!isISODate(date)) {
    return {
      date,
      logs: [],
      error: "This history date is not valid.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      date,
      logs: [],
      error: "You must be signed in.",
    };
  }

  const { data, error } = await supabase
    .from("food_logs")
    .select("id, user_id, food_name_snapshot, consumed_grams, logged_at, local_log_date")
    .eq("user_id", user.id)
    .eq("local_log_date", date)
    .order("logged_at", { ascending: true });

  if (error) {
    return {
      date,
      logs: [],
      error: "Food logs could not be loaded for this day.",
    };
  }

  return {
    date,
    logs: ((data ?? []) as FoodLogRow[]).map((log) => ({
      id: log.id,
      foodName: log.food_name_snapshot,
      grams: log.consumed_grams,
      gramLabel: formatGram(log.consumed_grams),
      loggedAt: log.logged_at,
    })),
    error: null,
  };
}
