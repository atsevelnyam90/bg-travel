import type { Metadata } from "next";
import { AdminNewListPage } from "@/features/builder/builder.config";

export const metadata: Metadata = { title: "New Dynamic List" };

export default function NewBuilderListPage() {
  return <AdminNewListPage />;
}
