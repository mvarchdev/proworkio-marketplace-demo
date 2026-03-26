import { Card } from "@proworkio/ui";

import { CustomerDashboardView } from "@/components/dashboard/customer-dashboard-view";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardHomePage() {
  return (
    <DashboardShell
      title="Prehľad účtu"
      description="Zákaznícky dashboard sleduje stav dopytov, firemný dashboard rieši leady, odomknutia a VIP billing. Obe strany zostávajú v jednom produkte."
    >
      <Card className="p-0 shadow-none">
        <CustomerDashboardView />
      </Card>
    </DashboardShell>
  );
}

