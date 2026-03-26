import { Suspense } from "react";
import { Container } from "@proworkio/ui";

import { AuthCard } from "@/components/forms/auth-card";

export default function PasswordResetPage() {
  return (
    <Container className="py-12">
      <Suspense fallback={null}>
        <AuthCard mode="password-reset" />
      </Suspense>
    </Container>
  );
}
