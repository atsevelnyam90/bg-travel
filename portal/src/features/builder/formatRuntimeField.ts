import { formatBuilderRuntimeValue } from "@duke333/builder-ui/runtime";
import type { builder } from "@/api/generated/contracts";
import { formatMinor } from "@/api/generated/contracts/money";

export function formatRuntimeField(value: unknown, field?: builder.BuilderField): string {
  if (value === null || value === undefined || value === "") return "—";
  if (field?.type === "money" && field.key.endsWith("Minor") && typeof value === "number") {
    return formatMinor(value);
  }
  if (field?.type === "select") {
    return (
      field.options?.find((option) => option.value === value)?.label ??
      formatBuilderRuntimeValue(value)
    );
  }
  return formatBuilderRuntimeValue(value);
}
