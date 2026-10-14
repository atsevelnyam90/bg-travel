import { Suspense } from "react";
import { LegacyDynamicFormRedirectPage } from "@/features/builder";

export default function LegacyDynamicFormPage() {
  return (
    <Suspense fallback={null}>
      <LegacyDynamicFormRedirectPage />
    </Suspense>
  );
}
