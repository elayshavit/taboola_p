import { CompanyPageClient } from "@/components/company/company-page-client";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function CompanyPage() {
  return (
    <ErrorBoundary>
      <CompanyPageClient />
    </ErrorBoundary>
  );
}
