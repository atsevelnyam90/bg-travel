"use client";

import { BuilderForm, BuilderGrid, BuilderView } from "@duke333/builder-ui";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  return id ? <BuilderForm formId={id} /> : <MissingKey label="Form" />;
}

export function DynamicListRoutePage() {
  const id = useSearchParams().get("id");
  return id ? <BuilderGrid listId={id} /> : <MissingKey label="List" />;
}

export function DynamicViewRoutePage() {
  const id = useSearchParams().get("id");
  return id ? <BuilderView viewId={id} /> : <MissingKey label="View" />;
}
