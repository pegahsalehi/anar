import { PageHeader } from "@/components/layout/page-header";
import { updateFoodAction } from "@/features/foods/actions";
import { FoodForm } from "@/features/foods/components/food-form";
import { getAuthenticatedFoodForEdit } from "@/features/foods/queries";

export const metadata = {
  title: "Edit Food",
};

type EditFoodPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditFoodPage({ params }: EditFoodPageProps) {
  const { id } = await params;
  const { food, imageUrl } = await getAuthenticatedFoodForEdit(id);
  const action = updateFoodAction.bind(null, id);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={food.name}
        title="Edit food"
        description="Changes apply to future logs. Existing food log snapshots stay unchanged."
      />
      <FoodForm action={action} food={food} imageUrl={imageUrl} submitLabel="Save changes" />
    </div>
  );
}
