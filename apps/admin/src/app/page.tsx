import { getDashboardViewModel } from "@/lib/admin-live-data";
import { DashboardView } from "@/components/dashboard-view";

export default async function HomePage() {
  const model = await getDashboardViewModel();

  return <DashboardView {...model} />;
}
