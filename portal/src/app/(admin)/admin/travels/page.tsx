import type { Metadata } from "next";
import { DynamicView } from "@/features/builder/components/DynamicView";
import { BUILDER_RUNTIME_IDS } from "@/features/builder/runtimeIds";

export const metadata: Metadata = { title: "Аялал" };

export default function AdminTravelsPage() {
  return <DynamicView viewId={BUILDER_RUNTIME_IDS.travelView} />;
}
