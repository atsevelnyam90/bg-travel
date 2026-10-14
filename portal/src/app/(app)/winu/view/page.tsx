import { Suspense } from "react";
import { LegacyDynamicViewRedirectPage } from "@/features/builder";

export default function LegacyDynamicViewPage() {
  return (
    <Suspense fallback={null}>
      <LegacyDynamicViewRedirectPage />
    </Suspense>
  );
}
