import type { Metadata } from "next";
import { DynamicFormRoutePage } from "@/features/builder";

export const metadata: Metadata = { title: "Dynamic Form" };

export default function DynamicFormPage() {
  return <DynamicFormRoutePage />;
}
