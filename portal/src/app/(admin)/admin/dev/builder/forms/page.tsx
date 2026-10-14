import type { Metadata } from "next";
import { AdminFormsPage } from "@/features/builder/builder.config";

export const metadata: Metadata = { title: "Dynamic Forms" };

export default function BuilderFormsPage() {
  return <AdminFormsPage />;
}
