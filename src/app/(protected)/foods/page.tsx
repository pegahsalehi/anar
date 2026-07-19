import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { FoodCard } from "@/components/foods/food-card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuthenticatedFoods } from "@/features/foods/queries";

export const metadata = {
  title: "Food Library",
};

type FoodsPageProps = {
  searchParams: Promise<{
    q?: string;
    created?: string;
    updated?: string;
  }>;
};

export default async function FoodsPage({ searchParams }: FoodsPageProps) {
  const { q, created, updated } = await searchParams;
  const searchTerm = q?.trim() ?? "";
  const { foods, error } = await getAuthenticatedFoods(searchTerm);
  const notice = created ? "Food created." : updated ? "Food updated." : null;

  return (
    <div className="space-y-7">
      <PageHeader
        title="Food Library"
        description="Your reusable foods with nutrition values per 100 g."
        action={
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#49C995] active:bg-[#38B982]"
            href="/foods/new"
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
            New food
          </Link>
        }
      />

      {notice ? (
        <p className="rounded-md border border-primary/30 bg-primary/15 px-4 py-3 text-sm font-semibold text-foreground" role="status">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-coral/25 bg-coral/10 px-4 py-3 text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}

      <form
        action="/foods"
        className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-card px-4 text-sm shadow-sm"
      >
        <Search aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
        <label className="sr-only" htmlFor="food-search">
          Search foods
        </label>
        <input
          className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
          defaultValue={searchTerm}
          id="food-search"
          name="q"
          placeholder="Search foods"
          type="search"
        />
      </form>

      {foods.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {foods.map((food) => (
            <FoodCard food={food} key={food.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchTerm ? "No matching foods" : "No foods yet"}
          description={
            searchTerm
              ? "Try another search or create a new food for your library."
              : "Create your first reusable food, then log it from Today."
          }
          action={
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#49C995]"
              href="/foods/new"
            >
              <Plus aria-hidden="true" className="h-5 w-5" />
              New food
            </Link>
          }
        />
      )}
    </div>
  );
}
