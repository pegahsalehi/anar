import { PageHeader } from "@/components/layout/page-header";
import { ProfileContent } from "@/features/profile/components/profile-content";
import { getProfilePageData } from "@/features/profile/queries";

export const metadata = {
  title: "Profile",
};

type ProfilePageProps = {
  searchParams: Promise<{
    auth_error?: string;
    auth_status?: string;
  }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const { auth_error: authError, auth_status: authStatus } = await searchParams;
  const data = await getProfilePageData();
  const accountMessage = getAccountStatusMessage({ authError, authStatus });

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
      {accountMessage ? (
        <p
          className={
            accountMessage.status === "success"
              ? "rounded-md border border-primary/35 bg-primary/10 px-4 py-3 text-sm font-semibold text-foreground"
              : "rounded-md border border-coral/25 bg-coral/10 px-4 py-3 text-sm text-coral"
          }
          role={accountMessage.status === "error" ? "alert" : "status"}
        >
          {accountMessage.message}
        </p>
      ) : null}
      <ProfileContent data={data} />
    </div>
  );
}

function getAccountStatusMessage({
  authError,
  authStatus,
}: {
  authError?: string;
  authStatus?: string;
}) {
  if (authStatus === "email_updated") {
    return {
      status: "success" as const,
      message: "Your email address has been updated.",
    };
  }

  if (!authError) {
    return null;
  }

  return {
    status: "error" as const,
    message: "Your email change could not be confirmed. Please try again.",
  };
}
