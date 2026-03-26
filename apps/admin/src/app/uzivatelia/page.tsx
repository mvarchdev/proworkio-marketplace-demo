import { getResourceViewModel } from "@/lib/admin-live-data";
import { ResourceView } from "@/components/resource-view";

export default async function UsersPage() {
  const model = await getResourceViewModel("users");

  return <ResourceView {...model} />;
}
