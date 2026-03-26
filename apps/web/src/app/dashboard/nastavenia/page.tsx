import { CustomerDashboardView } from "@/components/dashboard/customer-dashboard-view";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardSettingsPage() {
  return (
    <DashboardShell
      title="Nastavenia účtu"
      description="Účet je pripravený na claim guest dopytov, reset hesla a ďalšie rozšírenia profilových preferencií."
    >
      <CustomerDashboardView mode="settings" />
    </DashboardShell>
  );
}

