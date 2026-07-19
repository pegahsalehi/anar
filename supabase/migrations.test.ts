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
const singleDailyNutritionTargetsMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260719203000_use_single_daily_nutrition_targets.sql",
  ),
  "utf8",
);
const profilePreferencesMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260720110000_add_profile_identity_and_preferences.sql",
  ),
  "utf8",
);
const imageAvatarIdsMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260720123000_use_image_avatar_ids.sql",
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
    expect(singleDailyNutritionTargetsMigration).toContain(
      "grant select, insert, update on table public.daily_goals to authenticated;",
    );
    expect(singleDailyNutritionTargetsMigration).not.toMatch(
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

  it("converts legacy daily nutrition data to targets without weakening ownership", () => {
    expect(singleDailyNutritionTargetsMigration).toContain(
      "calories_target = (greatest(coalesce(calories_min, calories_target, 0), 0) + greatest(coalesce(calories_max, calories_target, 0), 0)) / 2",
    );
    expect(singleDailyNutritionTargetsMigration).toContain(
      "drop column if exists calories_min",
    );
    expect(singleDailyNutritionTargetsMigration).toContain(
      "drop column if exists fat_max",
    );
    expect(singleDailyNutritionTargetsMigration).toContain(
      "daily_goals_nonnegative_calories_target",
    );
    expect(singleDailyNutritionTargetsMigration).toContain(
      "alter table public.daily_goals enable row level security;",
    );
    expect(singleDailyNutritionTargetsMigration).toContain(
      "grant select, insert, update on table public.daily_goals to authenticated;",
    );
  });

  it("adds profile identity and preference fields with safe defaults", () => {
    expect(profilePreferencesMigration).toContain(
      "add column if not exists avatar_id text not null default 'pomegranate'",
    );
    expect(profilePreferencesMigration).toContain(
      "add column if not exists week_starts_on text not null default 'monday'",
    );
    expect(profilePreferencesMigration).toContain(
      "add column if not exists time_format text not null default '12h'",
    );
    expect(profilePreferencesMigration).toContain("profiles_avatar_id_check");
    expect(profilePreferencesMigration).toContain("profiles_week_starts_on_check");
    expect(profilePreferencesMigration).toContain("profiles_time_format_check");
  });

  it("maps legacy avatar ids to image-backed avatar ids", () => {
    expect(imageAvatarIdsMigration).toContain(
      "drop constraint if exists profiles_avatar_id_check",
    );
    expect(imageAvatarIdsMigration).toContain("alter column avatar_id set default '1'");
    expect(imageAvatarIdsMigration).toContain("when 'pomegranate' then '4'");
    expect(imageAvatarIdsMigration).toContain("when 'avocado' then '1'");
    expect(imageAvatarIdsMigration).toContain("when 'strawberry' then '2'");
    expect(imageAvatarIdsMigration).toContain("when 'carrot' then '6'");
    expect(imageAvatarIdsMigration).toContain("when 'lemon' then '3'");
    expect(imageAvatarIdsMigration).toContain("when 'walnut' then '9'");
    expect(imageAvatarIdsMigration).toContain(
      "check (avatar_id in ('1', '2', '3', '4', '5', '6', '7', '8', '9'))",
    );
  });
});
