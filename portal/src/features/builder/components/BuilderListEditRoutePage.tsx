"use client";

import { useSearchParams } from "next/navigation";
import { BuilderListEditorPage } from "./BuilderListEditorPage";

export function BuilderListEditRoutePage() {
  const searchParams = useSearchParams();
  const listId = searchParams.get("id") ?? undefined;

  if (!listId) {
    return <div className="text-destructive text-sm">List id олдсонгүй.</div>;
  }

  return <BuilderListEditorPage listId={listId} />;
}
