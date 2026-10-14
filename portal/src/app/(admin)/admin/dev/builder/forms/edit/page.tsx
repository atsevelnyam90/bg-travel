import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEditFormRoutePage } from "@/features/builder/builder.config";

export const metadata: Metadata = { title: "Edit Dynamic Form" };

export default function EditBuilderFormPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
      <AdminEditFormRoutePage />
    </Suspense>
  );
}
