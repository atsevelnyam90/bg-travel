import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEditViewRoutePage } from "@/features/builder/builder.config";

export const metadata: Metadata = { title: "Edit Dynamic View" };

export default function EditBuilderViewPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
      <AdminEditViewRoutePage />
    </Suspense>
  );
}
