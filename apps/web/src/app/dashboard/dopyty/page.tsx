import { CustomerDashboardView } from "@/components/dashboard/customer-dashboard-view";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardRequestsPage() {
  return (
    <DashboardShell
      title="Moje dopyty"
      description="Sledujte, ktoré dopyty čakajú na potvrdenie, ktoré sú aktívne a ktoré už boli uzatvorené alebo archivované."
    >
      <CustomerDashboardView mode="requests" />
    </DashboardShell>
  );
}

