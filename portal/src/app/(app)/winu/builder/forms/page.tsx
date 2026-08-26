import type { Metadata } from "next";
import { BuilderFormsManager } from "@/features/builder";

export const metadata: Metadata = { title: "Dynamic Forms" };

export default function BuilderFormsPage() {
  return <BuilderFormsManager />;
}
