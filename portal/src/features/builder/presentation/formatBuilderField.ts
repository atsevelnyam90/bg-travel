import type { ReadyBuilderContracts } from "@duke333/builder-ui";
import { formatBuilderRuntimeValue } from "@duke333/builder-ui/runtime";
import { formatMinor } from "@/api/generated/contracts/money";

type BuilderField = ReadyBuilderContracts["BuilderForm"]["schema"]["fields"][number];

export function formatBuilderField(value: unknown, field?: BuilderField): string {
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
