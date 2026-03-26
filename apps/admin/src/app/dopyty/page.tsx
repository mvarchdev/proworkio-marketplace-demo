import { getResourceViewModel } from "@/lib/admin-live-data";
import { ResourceView } from "@/components/resource-view";

export default async function RequestsPage() {
  const model = await getResourceViewModel("requests");

  return <ResourceView {...model} />;
}
