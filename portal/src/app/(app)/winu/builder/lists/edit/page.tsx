import type { Metadata } from "next";
import { BuilderListEditRoutePage } from "@/features/builder";

export const metadata: Metadata = { title: "Dynamic List засах" };

export default function EditBuilderListPage() {
  return <BuilderListEditRoutePage />;
}
