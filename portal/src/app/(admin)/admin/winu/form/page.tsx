import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicFormRoutePage } from "@/features/builder";

export const metadata: Metadata = { title: "Dynamic Form" };

export default function DynamicFormPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
      <DynamicFormRoutePage />
    </Suspense>
  );
}
