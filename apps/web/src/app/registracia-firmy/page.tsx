import { Container } from "@proworkio/ui";

import { CompanyOnboardingForm } from "@/components/forms/company-onboarding-form";
import { getAllCategories } from "@/lib/site";

export default async function CompanyRegistrationPage() {
  const categories = await getAllCategories();

  return (
    <Container className="space-y-8 py-12">
      <CompanyOnboardingForm categories={categories} />
    </Container>
  );
}

