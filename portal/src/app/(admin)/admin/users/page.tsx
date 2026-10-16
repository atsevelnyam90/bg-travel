import { BuilderView } from "@duke333/builder-ui";
import type { Metadata } from "next";
import { BUILDER_RUNTIME_IDS } from "@/features/builder/runtimeIds";

export const metadata: Metadata = { title: "Хэрэглэгч" };

export default function UsersPage() {
  return <BuilderView viewId={BUILDER_RUNTIME_IDS.userView} />;
}
