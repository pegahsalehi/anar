<<<<<<< HEAD
# Anar

Anar is an English LTR personal nutrition tracker built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

## Current Phase

The app currently includes:

- Strict TypeScript Next.js scaffold.
- English LTR document setup.
- Official Anar logo assets, green design tokens, light theme, favicon, and app icon.
- Public, auth, and protected route structure.
- Reusable layout, navigation, empty, loading, food, history, and nutrition UI primitives.
- Supabase SSR clients, middleware session refresh, protected-route redirects, and auth server actions.
- Initial Supabase migrations for `profiles`, `daily_goals`, `foods`, `food_logs`, and private `food-images` storage.
- Explicit `authenticated` table grants and RLS ownership policies using `auth.uid()`.
- Supabase-backed Food Library create, edit, favorite, soft-delete, and private image upload/display.
- Supabase-backed Today food logging, daily totals, quick access, streak stats, log gram edits, and log deletion.

Profile editing and daily-goal editing controls are not implemented yet.

## Supabase Setup

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

In Supabase Auth, configure redirect URLs for local development:

```text
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
```

Apply the migrations in `supabase/migrations`.

The migrations assume the Supabase project has:

- Automatically expose new tables: disabled
- Enable automatic RLS: enabled

Every app-owned table explicitly revokes table privileges from `anon`, grants only required table privileges to `authenticated`, enables RLS, and uses strict ownership policies based on `auth.uid()`. Primary keys use UUID defaults, so no sequence privileges are required or granted.

## Local Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

The current local environment uses Node.js 18.20.4, so the project is pinned to the latest compatible Next.js 15 line instead of Next.js 16, which requires Node.js 20.9+.
=======
# anar
A personal nutrition tracking web application built with Next.js and Supabase.
>>>>>>> 78da3695a01834b3ad880cbb25cf926e02f5bd17
