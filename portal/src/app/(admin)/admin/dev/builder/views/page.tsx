import type { Metadata } from "next";
import { AdminViewsPage } from "@/features/builder/builder.config";

export const metadata: Metadata = { title: "Dynamic Views" };

export default function BuilderViewsPage() {
  return <AdminViewsPage />;
}
