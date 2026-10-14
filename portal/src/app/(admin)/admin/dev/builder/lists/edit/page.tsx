import type { Metadata } from "next";
import { AdminEditListPage } from "@/features/builder/builder.config";

export const metadata: Metadata = { title: "Edit Dynamic List" };

export default async function EditBuilderListPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <AdminEditListPage listId={id} />;
}
