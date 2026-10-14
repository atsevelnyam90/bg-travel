import { Suspense } from "react";
import { LegacyDynamicListRedirectPage } from "@/features/builder";

export default function LegacyDynamicListPage() {
  return (
    <Suspense fallback={null}>
      <LegacyDynamicListRedirectPage />
    </Suspense>
  );
}
