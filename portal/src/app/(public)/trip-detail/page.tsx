import type { Metadata } from "next";
import { Suspense } from "react";
import { BlackTomatoLostGenerationSnapshotPage } from "@/features/blacktomato/components/BlackTomatoLostGenerationSnapshotPage";

export const metadata: Metadata = {
  title: "Аяллын дэлгэрэнгүй | BG Travel",
  description: "BG Travel аяллын дэлгэрэнгүй хөтөлбөр, гаралт болон захиалга.",
};

export default function TripDetailPage() {
  return (
    <Suspense fallback={null}>
      <BlackTomatoLostGenerationSnapshotPage />
    </Suspense>
  );
}
