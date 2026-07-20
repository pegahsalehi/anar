# Legal Setup Checklist

Reviewed on: 2026-07-20

## Required Placeholder Replacements

Replace these visible development placeholders before production:

- `[EFFECTIVE DATE]`
- `[CONTACT EMAIL]`
- `[LEGAL OWNER OR COMPANY NAME]`
- `[COUNTRY / JURISDICTION]`

Do not publish the governing-law section until the correct jurisdiction has been selected.

## Actual Service Providers Found

- Supabase Auth, using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Supabase PostgreSQL tables for application data.
- Supabase Storage bucket `food-images` for private food images.
- Supabase Auth email flows for signup confirmation, password reset, and email-change confirmation.
- Next.js `next/font/google` is used to bundle the Manrope font at build time; no runtime Google Fonts request was found in the app code.

No separate analytics, advertising, payment, error-tracking, email-marketing, or tracking-pixel provider was found in the repository.

The production hosting provider was not identifiable from the repository. Confirm it before production privacy review.

## Actual Data Categories Found

- Account email and Supabase authentication/session records.
- Profile display name.
- Profile avatar ID.
- Timezone, week-start preference, and time-format preference.
- Daily nutrition targets for calories, protein, carbohydrates, and fat.
- Saved foods, including name, calories, protein, carbohydrates, fat, notes, favorite status, and optional image path.
- Food logs, including consumed grams, timestamps, local log dates, food snapshots, nutrition snapshots, and optional image snapshots.
- Calculated activity data such as active days and streaks derived from food-log dates.
- Uploaded food images after client-side optimization/compression.
- Supabase SSR authentication cookies.
- Technical logs and request/security records may be processed by Supabase and the hosting environment.

## Actual Deletion Behavior

- Food logs can be deleted by the authenticated owner.
- Saved foods are soft-deleted with `deleted_at`; they are hidden from normal food queries but remain in the database.
- Food images are removed from Supabase Storage when an image is replaced or removed during food editing.
- Public tables reference `auth.users` with `on delete cascade`, so deleting a Supabase Auth user should cascade database rows for `profiles`, `daily_goals`, `foods`, and `food_logs`.
- Permanent account deletion is available from the Profile page danger zone and runs through a server action.
- Account deletion first removes verified current-user Storage paths from `profiles.avatar_path`, `foods.image_path`, and `food_logs.image_path_snapshot` in the private `food-images` bucket.
- If Storage cleanup fails, the Supabase Auth user is not deleted and the signed-in session is kept active.
- After Storage cleanup succeeds, the server action hard-deletes the current Supabase Auth user with the admin API, signs out, and redirects to `/login?deleted=1`.

## Analytics And Cookies

- Analytics found: none.
- Advertising or targeted-ad tracking found: none.
- Non-essential cookies found: none.
- Essential cookies found: Supabase SSR authentication/session cookies.

## Legal Review Reminder

Obtain jurisdiction-specific legal review before production release, especially for privacy rights, consent wording, age requirements, retention/deletion commitments, governing law, and any health or nutrition disclaimer requirements.
