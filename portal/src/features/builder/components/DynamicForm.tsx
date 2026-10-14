"use client";

import {
  createDynamicFormComponent,
  type DynamicFormErrorStateProps,
  type DynamicFormFieldsProps,
  type DynamicFormShellProps,
  type DynamicFormSubmitProps,
} from "@duke333/builder-ui/components";
import type { BuilderRuntimeFormValues } from "@duke333/builder-ui/runtime";
import { toast } from "sonner";
import type { builder } from "@/api/generated/contracts";
import { DataForm } from "@/components/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import type { PortalBuilderApiContracts } from "../builder.config";
import { useRuntimeBuilderForm, useSaveRuntimeBuilderFormEntry } from "../builder.config";

function FormShell({ title, children }: DynamicFormShellProps) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function FormFields({
  formId,
  schema,
  namePrefix,
}: DynamicFormFieldsProps<builder.BuilderFormSchema>) {
  return (
    <FieldGroup>
      <DataForm<BuilderRuntimeFormValues> formId={formId} schema={schema} namePrefix={namePrefix} />
    </FieldGroup>
  );
}

function SubmitButton({ isSaving }: DynamicFormSubmitProps) {
  return (
    <div className="flex justify-end">
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Хадгалж байна..." : "Хадгалах"}
      </Button>
    </div>
  );
}

function ErrorState({ title, description }: DynamicFormErrorStateProps) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">{description}</CardContent>
    </Card>
  );
}

export const DynamicForm = createDynamicFormComponent<PortalBuilderApiContracts>({
  hooks: {
    useRuntimeBuilderForm,
    useSaveRuntimeBuilderFormEntry,
  },
  FormShell,
  FormFields,
  SubmitButton,
  ErrorState,
  notifications: {
    success: toast.success,
    error: toast.error,
    errorMessage(error, fallback) {
      return apiErrorMessage(error, fallback);
    },
  },
});
