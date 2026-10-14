import type { Metadata } from "next";
import { AdminEditViewPage } from "@/features/builder/builder.config";

export const metadata: Metadata = { title: "Edit Dynamic View" };

export default async function EditBuilderViewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <AdminEditViewPage viewId={id} />;
}
