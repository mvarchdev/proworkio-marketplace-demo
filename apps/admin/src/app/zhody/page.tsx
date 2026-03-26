import { getResourceViewModel } from "@/lib/admin-live-data";
import { ResourceView } from "@/components/resource-view";

export default async function MatchesPage() {
  const model = await getResourceViewModel("matches");

  return <ResourceView {...model} />;
}
