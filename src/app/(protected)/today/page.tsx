import { TodayDashboard } from "@/features/today/components/today-dashboard";
import { getTodayDashboardData } from "@/features/today/queries";

export const metadata = {
  title: "Today",
};

export default async function TodayPage() {
  const data = await getTodayDashboardData();

  return <TodayDashboard data={data} />;
}
