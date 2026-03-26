import { CompanyDashboardView } from "@/components/dashboard/company-dashboard-view";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function CompanyDashboardPage() {
  return (
    <DashboardShell
      title="Firemný dashboard"
      description="Prehľad onboarding stavu, VIP plánu, odomknutých leadov a pripravenosti profilu na moderáciu."
    >
      <CompanyDashboardView />
    </DashboardShell>
  );
}

