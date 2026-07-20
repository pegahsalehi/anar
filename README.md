<div align="center">

# Anar

### Nutrition tracking built around the food you actually eat.

Add your everyday meals once, build a personal food library, and log them again in seconds.

<p>
  <img alt="Next.js 15" src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white" />
  <img alt="Project status" src="https://img.shields.io/badge/status-in_development-F59E0B" />
</p>

</div>

---

## Why Anar?

Most nutrition apps give you an enormous food database, yet the meal you actually eat—a local dish, a homemade recipe, or your usual breakfast—is often missing or buried under dozens of irrelevant results.

Anar takes a different approach.

You create a small, personal library around your real routine. Save a food once, reuse it whenever you need it, and keep daily nutrition tracking fast, calm, and useful.

> Your diet does not contain every food in the world. Your tracker should not feel like it does.

## Product Preview

<!-- Expected screenshot filenames:
public/images/screenshot app/today.png
public/images/screenshot app/library.png
public/images/screenshot app/history.png
-->

| Today | Food Library | History |
| :---: | :---: | :---: |
| ![Anar Today dashboard](./public/images/screenshot%20app/today.png) | ![Anar personal food library](./public/images/screenshot%20app/library.png) | ![Anar nutrition history](./public/images/screenshot%20app/history.png) |

## The Core Idea

People usually return to a familiar set of meals. Anar turns that repetition into a better experience:

1. **Add it once** — save a local food, homemade recipe, snack, or everyday meal.
2. **Build your library** — create a collection that reflects how you actually eat.
3. **Log it quickly** — reuse saved foods without searching through a crowded global database.
4. **Understand your routine** — follow daily totals and review your nutrition history over time.

## Features

- **Personal food library** — create, edit, favorite, and organize your own foods.
- **Local and homemade foods** — track meals that generic databases often miss.
- **Fast daily logging** — add familiar foods to Today with minimal friction.
- **Macro overview** — follow calories, protein, carbohydrates, and fat at a glance.
- **Editable portions** — update logged gram amounts without rebuilding an entry.
- **Quick access** — reach frequently used foods faster.
- **Daily history** — review previous logs and understand patterns over time.
- **Private food images** — upload and display images through protected Supabase storage.
- **Secure accounts** — protected routes, server-side authentication, and ownership-based data access.
- **Focused interface** — a lightweight experience designed to avoid unnecessary clutter.

## Built for Simplicity

Anar is intentionally not another universal food catalogue. Its value grows from the foods each person chooses to save.

That makes the app especially useful for:

- recurring breakfasts, snacks, and drinks;
- homemade recipes with known ingredients;
- regional and local dishes;
- personal meal-prep combinations;
- foods that are difficult to find in mainstream nutrition databases.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15 with App Router |
| Language | TypeScript with strict mode |
| Styling | Tailwind CSS |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth with SSR session handling |
| Storage | Private Supabase Storage buckets |
| Security | Row Level Security and ownership policies |

## Security and Privacy

Nutrition history is personal. Anar keeps user-owned data isolated at the database level.

- Application tables revoke access from anonymous users.
- Authenticated users receive only the permissions required by the app.
- Row Level Security is enabled for user-owned data.
- Ownership policies are based on `auth.uid()`.
- Food images are stored in private storage and served through authenticated access.
- Protected routes refresh and validate sessions through middleware.

## Data Model

The initial Supabase schema includes:

- `profiles`
- `daily_goals`
- `foods`
- `food_logs`
- private `food-images` storage

Database migrations are located in [`supabase/migrations`](./supabase/migrations).

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` from `.env.example` and provide your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Configure Supabase Auth

Add the local callback URLs to the allowed redirect URLs in Supabase Auth:

```text
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
```

### 4. Apply database migrations

Run the migrations from:

```text
supabase/migrations
```

The migrations assume:

```text
Automatically expose new tables: disabled
Enable automatic RLS: enabled
```

### 5. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Commands

```bash
npm run dev        # Start the development server
npm run lint       # Run lint checks
npm run typecheck  # Run TypeScript checks
npm test           # Run tests
npm run build      # Create a production build
```

## Project Status

Anar is under active development. The current foundation includes authentication, protected application routes, the personal Food Library, daily food logging, nutrition totals, quick access, streak statistics, history UI, private image handling, and ownership-based database security.

## Design Principle

> Add once. Log often. Understand your everyday food.

Anar is designed around one simple belief: **the best nutrition tracker is not the one with the largest database—it is the one that remembers the meals that matter to you.**

---

<div align="center">
  <strong>Anar</strong><br />
  A quieter, more personal way to understand your nutrition.
</div>
