import { PageHeader } from "@/components/layout/page-header";
import { ProfileContent } from "@/features/profile/components/profile-content";
import { getProfilePageData } from "@/features/profile/queries";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const data = await getProfilePageData();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Profile"
        description="Manage your personal information and account security."
      />
      {data.error ? (
        <p
          className="rounded-md border border-coral/25 bg-coral/10 px-4 py-3 text-sm text-coral"
          role="alert"
        >
          {data.error}
        </p>
      ) : null}
      <ProfileContent data={data} />
    </div>
  );
}
