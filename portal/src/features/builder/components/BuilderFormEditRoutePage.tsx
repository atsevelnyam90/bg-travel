"use client";

import { useSearchParams } from "next/navigation";
import { BuilderFormEditorPage } from "./BuilderFormEditorPage";

export function BuilderFormEditRoutePage() {
  const searchParams = useSearchParams();
  const formId = searchParams.get("id") ?? undefined;

  if (!formId) {
    return <div className="text-destructive text-sm">Form id олдсонгүй.</div>;
  }

  return <BuilderFormEditorPage formId={formId} />;
}
