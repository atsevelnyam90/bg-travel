import type { Metadata } from "next";
import { DynamicViewRoutePage } from "@/features/builder";

export const metadata: Metadata = { title: "Dynamic View" };

export default function DynamicViewPage() {
  return <DynamicViewRoutePage />;
}
