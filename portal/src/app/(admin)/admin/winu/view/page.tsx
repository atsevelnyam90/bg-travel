import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicViewRoutePage } from "@/features/builder";

export const metadata: Metadata = { title: "Dynamic View" };

export default function DynamicViewPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
      <DynamicViewRoutePage />
    </Suspense>
  );
}
