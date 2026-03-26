import { getResourceViewModel } from "@/lib/admin-live-data";
import { ResourceView } from "@/components/resource-view";

export default async function PaymentsPage() {
  const model = await getResourceViewModel("payments");

  return <ResourceView {...model} />;
}
