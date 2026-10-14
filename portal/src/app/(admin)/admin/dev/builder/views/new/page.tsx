import type { Metadata } from "next";
import { AdminNewViewPage } from "@/features/builder/builder.config";

export const metadata: Metadata = { title: "New Dynamic View" };

export default function NewBuilderViewPage() {
  return <AdminNewViewPage />;
}
