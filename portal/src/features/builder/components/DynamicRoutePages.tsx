"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicForm } from "./DynamicForm";
import { DynamicList } from "./DynamicList";
import { DynamicView } from "./DynamicView";

function MissingKey({ label }: { label: string }) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{label} key алга</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        Runtime route нээхдээ `?id=` query ашиглана.
      </CardContent>
    </Card>
  );
}

export function DynamicFormRoutePage() {
  const id = useSearchParams().get("id");
  return id ? <DynamicForm formId={id} /> : <MissingKey label="Form" />;
}

export function DynamicListRoutePage() {
  const id = useSearchParams().get("id");
  return id ? <DynamicList listId={id} /> : <MissingKey label="List" />;
}

export function DynamicViewRoutePage() {
  const id = useSearchParams().get("id");
  return id ? <DynamicView viewId={id} /> : <MissingKey label="View" />;
}
