import { getResourceViewModel } from "@/lib/admin-live-data";
import { ResourceView } from "@/components/resource-view";

export default async function WebhooksPage() {
  const model = await getResourceViewModel("webhooks");

  return <ResourceView {...model} />;
}
