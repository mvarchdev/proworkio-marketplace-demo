import { getResourceViewModel } from "@/lib/admin-live-data";
import { ResourceView } from "@/components/resource-view";

export default async function ReviewsPage() {
  const model = await getResourceViewModel("reviews");

  return <ResourceView {...model} />;
}
