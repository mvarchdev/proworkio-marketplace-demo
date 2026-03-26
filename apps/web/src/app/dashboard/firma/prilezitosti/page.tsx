import { CompanyDashboardView } from "@/components/dashboard/company-dashboard-view";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function CompanyOpportunitiesPage() {
  return (
    <DashboardShell
      title="Zhodné príležitosti"
      description="Zobrazenie matchov, scoringu a odomknutí kontaktov. Produkčná cesta používa webhookom potvrdené platby a auditnú stopu."
    >
      <CompanyDashboardView mode="opportunities" />
    </DashboardShell>
  );
}

