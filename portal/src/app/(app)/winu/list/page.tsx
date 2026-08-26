import type { Metadata } from "next";
import { DynamicListRoutePage } from "@/features/builder";

export const metadata: Metadata = { title: "Dynamic List" };

export default function DynamicListPage() {
  return <DynamicListRoutePage />;
}
