import { redirect } from "next/navigation";

type LegacyRuntimePageProps = {
  searchParams: Promise<{ id?: string | string[] }>;
};

export default async function LegacyDynamicFormPage({ searchParams }: LegacyRuntimePageProps) {
  const id = (await searchParams).id;
  const value = Array.isArray(id) ? id[0] : id;
  redirect(value ? `/admin/winu/form?id=${encodeURIComponent(value)}` : "/admin/winu/form");
}
