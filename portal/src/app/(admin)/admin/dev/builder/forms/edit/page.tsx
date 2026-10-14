import type { Metadata } from "next";
import { AdminEditFormPage } from "@/features/builder/builder.config";

export const metadata: Metadata = { title: "Edit Dynamic Form" };

export default async function EditBuilderFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <AdminEditFormPage formId={id} />;
}
