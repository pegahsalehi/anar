import { PageHeader } from "@/components/layout/page-header";
import { createFoodAction } from "@/features/foods/actions";
import { FoodForm } from "@/features/foods/components/food-form";

export const metadata = {
  title: "New Food",
};

export default function NewFoodPage() {
  return (
    <div className="min-w-0 space-y-5 sm:space-y-7">
      <PageHeader
        title="New food"
        description="Enter nutrition values per 100 g. Images are stored privately in Supabase Storage."
      />
      <FoodForm action={createFoodAction} submitLabel="Save food" />
    </div>
  );
}
