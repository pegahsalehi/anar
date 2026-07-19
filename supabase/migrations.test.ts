import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const schemaMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260718132000_initial_private_nutrition_schema.sql",
  ),
  "utf8",
);
const storageMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260718132100_food_image_storage.sql",
  ),
  "utf8",
);
const fatMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260719090000_add_fat_nutrition_metric.sql",
  ),
  "utf8",
);
const duplicateFoodNameMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260719133000_add_active_food_name_unique_index.sql",
  ),
  "utf8",
);
const dailyGoalRangesMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260719152000_add_daily_goal_ranges.sql",
  ),
  "utf8",
);
const dailyGoalRangesRepairMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260719195500_repair_daily_goal_ranges_save_contract.sql",
  ),
  "utf8",
);

describe("Supabase migrations", () => {
  it("grant app-owned tables only to authenticated", () => {
    expect(schemaMigration).toContain(
      "grant select, update on table public.profiles to authenticated;",
    );
    expect(schemaMigration).toContain(
      "grant select, insert, update on table public.daily_goals to authenticated;",
    );
    expect(schemaMigration).toContain(
      "grant select, insert, update on table public.foods to authenticated;",
    );
    expect(schemaMigration).toContain(
      "grant select, insert, update, delete on table public.food_logs to authenticated;",
    );
    expect(schemaMigration).not.toMatch(
      /grant\s+.+\s+on\s+table\s+public\.(profiles|daily_goals|foods|food_logs)\s+to\s+anon/i,
    );
    expect(fatMigration).toContain(
      "grant select, insert, update on table public.daily_goals to authenticated;",
    );
    expect(fatMigration).toContain(
      "grant select, insert, update on table public.foods to authenticated;",
    );
    expect(fatMigration).toContain(
      "grant select, insert, update, delete on table public.food_logs to authenticated;",
    );
    expect(fatMigration).not.toMatch(
      /grant\s+.+\s+on\s+table\s+public\.(daily_goals|foods|food_logs)\s+to\s+anon/i,
    );
    expect(duplicateFoodNameMigration).toContain(
      "grant select, insert, update on table public.foods to authenticated;",
    );
    expect(duplicateFoodNameMigration).not.toMatch(
      /grant\s+.+\s+on\s+table\s+public\.foods\s+to\s+anon/i,
    );
    expect(dailyGoalRangesMigration).toContain(
      "grant select, insert, update on table public.daily_goals to authenticated;",
    );
    expect(dailyGoalRangesMigration).not.toMatch(
      /grant\s+.+\s+on\s+table\s+public\.daily_goals\s+to\s+anon/i,
    );
    expect(dailyGoalRangesRepairMigration).toContain(
      "grant select, insert, update on table public.daily_goals to authenticated;",
    );
    expect(dailyGoalRangesRepairMigration).not.toMatch(
      /grant\s+.+\s+on\s+table\s+public\.daily_goals\s+to\s+anon/i,
    );
  });

  it("keeps strict owner RLS policies and private storage policies", () => {
    expect(schemaMigration).toContain("alter table public.profiles enable row level security;");
    expect(schemaMigration).toContain("alter table public.foods enable row level security;");
    expect(schemaMigration).toContain("using (auth.uid() = user_id)");
    expect(schemaMigration).toContain("with check (auth.uid() = user_id)");
    expect(storageMigration).toContain("'food-images'");
    expect(storageMigration).toContain("false,");
    expect(storageMigration).toContain("to authenticated");
    expect(storageMigration).toContain("(storage.foldername(name))[1] = auth.uid()::text");
  });

  it("adds fat columns with safe backfills and constraints", () => {
    expect(fatMigration).toContain("add column if not exists fat_target");
    expect(fatMigration).toContain("add column if not exists fat_per_100g");
    expect(fatMigration).toContain("add column if not exists fat_per_100g_snapshot");
    expect(fatMigration).toContain("set fat_target = 70");
    expect(fatMigration).toContain("set fat_per_100g = 0");
    expect(fatMigration).toContain("set fat_per_100g_snapshot = 0");
    expect(fatMigration).toContain("daily_goals_positive_fat");
    expect(fatMigration).toContain("foods_nonnegative_fat");
    expect(fatMigration).toContain("food_logs_nonnegative_fat");
  });

  it("prevents duplicate active food names per user", () => {
    expect(duplicateFoodNameMigration).toContain("create unique index if not exists");
    expect(duplicateFoodNameMigration).toContain("foods_user_active_name_unique_idx");
    expect(duplicateFoodNameMigration).toContain("on public.foods (user_id, lower(btrim(name)))");
    expect(duplicateFoodNameMigration).toContain("where deleted_at is null");
  });

  it("adds daily goal ranges with nonnegative and ordered constraints", () => {
    expect(dailyGoalRangesMigration).toContain("add column if not exists calories_min");
    expect(dailyGoalRangesMigration).toContain("add column if not exists calories_max");
    expect(dailyGoalRangesMigration).toContain("add column if not exists protein_min");
    expect(dailyGoalRangesMigration).toContain("add column if not exists protein_max");
    expect(dailyGoalRangesMigration).toContain("add column if not exists carbohydrates_min");
    expect(dailyGoalRangesMigration).toContain("add column if not exists carbohydrates_max");
    expect(dailyGoalRangesMigration).toContain("add column if not exists fat_min");
    expect(dailyGoalRangesMigration).toContain("add column if not exists fat_max");
    expect(dailyGoalRangesMigration).toContain("daily_goals_nonnegative_calories_range");
    expect(dailyGoalRangesMigration).toContain("daily_goals_nonnegative_protein_range");
    expect(dailyGoalRangesMigration).toContain("daily_goals_nonnegative_carbohydrates_range");
    expect(dailyGoalRangesMigration).toContain("daily_goals_nonnegative_fat_range");
    expect(dailyGoalRangesMigration).toContain("daily_goals_calories_range_order");
    expect(dailyGoalRangesMigration).toContain("daily_goals_protein_range_order");
    expect(dailyGoalRangesMigration).toContain("daily_goals_carbohydrates_range_order");
    expect(dailyGoalRangesMigration).toContain("daily_goals_fat_range_order");
  });

  it("repairs the daily goal save contract without weakening ownership", () => {
    expect(dailyGoalRangesRepairMigration).toContain("add column if not exists calories_min");
    expect(dailyGoalRangesRepairMigration).toContain("add column if not exists calories_max");
    expect(dailyGoalRangesRepairMigration).toContain("add column if not exists protein_min");
    expect(dailyGoalRangesRepairMigration).toContain("add column if not exists protein_max");
    expect(dailyGoalRangesRepairMigration).toContain("add column if not exists carbohydrates_min");
    expect(dailyGoalRangesRepairMigration).toContain("add column if not exists carbohydrates_max");
    expect(dailyGoalRangesRepairMigration).toContain("add column if not exists fat_min");
    expect(dailyGoalRangesRepairMigration).toContain("add column if not exists fat_max");
    expect(dailyGoalRangesRepairMigration).toContain(
      "add constraint daily_goals_user_effective_date_unique unique (user_id, effective_date)",
    );
    expect(dailyGoalRangesRepairMigration).toContain(
      "alter table public.daily_goals enable row level security;",
    );
    expect(dailyGoalRangesRepairMigration).toContain("using (auth.uid() = user_id)");
    expect(dailyGoalRangesRepairMigration).toContain("with check (auth.uid() = user_id)");
    expect(dailyGoalRangesRepairMigration).toContain(
      "grant select, insert, update on table public.daily_goals to authenticated;",
    );
  });
});
