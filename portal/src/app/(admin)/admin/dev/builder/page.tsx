import type { Metadata } from "next";
import { AdminHomePage } from "@/features/builder/builder.config";

export const metadata: Metadata = { title: "Builder" };

export default function BuilderPage() {
  return <AdminHomePage />;
}
