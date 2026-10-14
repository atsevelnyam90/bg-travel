import type { Metadata } from "next";
import { AdminNewFormPage } from "@/features/builder/builder.config";

export const metadata: Metadata = { title: "New Dynamic Form" };

export default function NewBuilderFormPage() {
  return <AdminNewFormPage />;
}
