import { getResourceViewModel } from "@/lib/admin-live-data";
import { ResourceView } from "@/components/resource-view";

export default async function CompaniesPage() {
  const model = await getResourceViewModel("companies");

  return <ResourceView {...model} />;
}
