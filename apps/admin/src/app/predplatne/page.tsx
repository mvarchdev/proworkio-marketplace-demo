import { getResourceViewModel } from "@/lib/admin-live-data";
import { ResourceView } from "@/components/resource-view";

export default async function SubscriptionsPage() {
  const model = await getResourceViewModel("subscriptions");

  return <ResourceView {...model} />;
}
