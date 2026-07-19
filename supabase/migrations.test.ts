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
});
