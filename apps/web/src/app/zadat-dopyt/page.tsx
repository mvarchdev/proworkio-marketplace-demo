import { Container } from "@proworkio/ui";

import { RequestWizard } from "@/components/forms/request-wizard";
import { getAllCategories } from "@/lib/site";

export default async function SubmitRequestPage() {
  const categories = await getAllCategories();

  return (
    <Container className="space-y-8 py-12">
      <RequestWizard categories={categories} />
    </Container>
  );
}

