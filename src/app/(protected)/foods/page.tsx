import { ImagePlus, Plus, Search } from "lucide-react";
import { FoodCard } from "@/components/foods/food-card";
import { PageHeader } from "@/components/layout/page-header";
import { OnlineOnlyLink } from "@/components/pwa/online-status";
import { IllustratedEmptyState } from "@/components/ui/illustrated-empty-state";
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
    <div className="min-w-0 space-y-5 sm:space-y-7">
      <PageHeader
        title="Food Library"
        description="Your reusable foods with nutrition values per 100 g."
        action={
          <OnlineOnlyLink
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#49C995] active:bg-[#38B982] sm:min-h-12 sm:px-5 sm:py-3"
            href="/foods/new"
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
            New food
          </OnlineOnlyLink>
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
        className="flex min-h-11 items-center gap-2.5 rounded-md border border-border bg-card px-3 text-sm shadow-sm sm:min-h-12 sm:gap-3 sm:px-4"
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
        <div className="grid gap-2.5 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">
          {foods.map((food) => (
            <FoodCard food={food} key={food.id} />
          ))}
        </div>
      ) : (
        <IllustratedEmptyState
          title={searchTerm ? "No matching foods" : "Your library is empty"}
          description={
            searchTerm
              ? "Try another search or create a new food for your library."
              : "Create reusable foods first, then log them here by grams."
          }
          illustrationSrc="/images/empty-states/nutrition-book.png"
          action={
            <OnlineOnlyLink
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-base font-semibold text-primary-foreground shadow-soft transition hover:bg-[#49C995] active:bg-[#38B982]"
              href="/foods/new"
            >
              <ImagePlus aria-hidden="true" className="h-5 w-5" />
              Create food
            </OnlineOnlyLink>
          }
        />
      )}
    </div>
  );
}
