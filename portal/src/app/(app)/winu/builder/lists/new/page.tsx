import type { Metadata } from "next";
import { BuilderListEditorPage } from "@/features/builder";

export const metadata: Metadata = { title: "Dynamic List нэмэх" };

export default function NewBuilderListPage() {
  return <BuilderListEditorPage />;
}
