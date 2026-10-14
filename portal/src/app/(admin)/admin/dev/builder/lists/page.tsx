import type { Metadata } from "next";
import { AdminListsPage } from "@/features/builder/builder.config";

export const metadata: Metadata = { title: "Dynamic Lists" };

export default function BuilderListsPage() {
  return <AdminListsPage />;
}
