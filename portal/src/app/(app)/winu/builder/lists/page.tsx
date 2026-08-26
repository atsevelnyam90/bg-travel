import type { Metadata } from "next";
import { BuilderListsManager } from "@/features/builder";

export const metadata: Metadata = { title: "Dynamic Lists" };

export default function BuilderListsPage() {
  return <BuilderListsManager />;
}
