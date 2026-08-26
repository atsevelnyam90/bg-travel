import type { Metadata } from "next";
import { BuilderFormEditRoutePage } from "@/features/builder";

export const metadata: Metadata = { title: "Dynamic Form засах" };

export default function EditBuilderFormPage() {
  return <BuilderFormEditRoutePage />;
}
