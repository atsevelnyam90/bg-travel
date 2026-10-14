import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEditListRoutePage } from "@/features/builder/builder.config";

export const metadata: Metadata = { title: "Edit Dynamic List" };

export default function EditBuilderListPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
      <AdminEditListRoutePage />
    </Suspense>
  );
}
