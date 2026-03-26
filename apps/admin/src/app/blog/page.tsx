import { getResourceViewModel } from "@/lib/admin-live-data";
import { ResourceView } from "@/components/resource-view";

export default async function BlogPage() {
  const model = await getResourceViewModel("blog");

  return <ResourceView {...model} />;
}
