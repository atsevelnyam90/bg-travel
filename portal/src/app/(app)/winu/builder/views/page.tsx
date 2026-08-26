import type { Metadata } from "next";
import { BuilderViewsManager } from "@/features/builder";

export const metadata: Metadata = { title: "Dynamic Views" };

export default function BuilderViewsPage() {
  return <BuilderViewsManager />;
}
