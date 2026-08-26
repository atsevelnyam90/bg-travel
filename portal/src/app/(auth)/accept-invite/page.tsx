import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AcceptInviteForm } from "@/features/auth/components/AcceptInviteForm";

export const metadata: Metadata = { title: "Урилга хүлээн авах" };

// useSearchParams() нь Suspense хүрээ шаарддаг (static export-д ч ажиллана).
export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
      <AcceptInviteForm />
    </Suspense>
  );
}
