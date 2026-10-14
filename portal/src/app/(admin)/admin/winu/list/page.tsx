import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicListRoutePage } from "@/features/builder";

export const metadata: Metadata = { title: "Dynamic List" };

export default function DynamicListPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
      <DynamicListRoutePage />
    </Suspense>
  );
}
