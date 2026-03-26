import { Container } from "@proworkio/ui";

import { ClaimRequestCard } from "@/components/forms/claim-request-card";

export default async function ClaimRequestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <Container className="py-12">
      <ClaimRequestCard token={token} />
    </Container>
  );
}

