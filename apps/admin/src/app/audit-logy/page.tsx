import { getResourceViewModel } from "@/lib/admin-live-data";
import { ResourceView } from "@/components/resource-view";

export default async function AuditLogsPage() {
  const model = await getResourceViewModel("auditLogs");

  return <ResourceView {...model} />;
}
