import { getResourceViewModel } from "@/lib/admin-live-data";
import { ResourceView } from "@/components/resource-view";

export default async function NotificationsPage() {
  const model = await getResourceViewModel("notifications");

  return <ResourceView {...model} />;
}
