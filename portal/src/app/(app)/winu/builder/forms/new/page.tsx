import type { Metadata } from "next";
import { BuilderFormEditorPage } from "@/features/builder";

export const metadata: Metadata = { title: "Dynamic Form нэмэх" };

export default function NewBuilderFormPage() {
  return <BuilderFormEditorPage />;
}
