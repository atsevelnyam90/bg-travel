import type { Metadata } from "next";
import { BuilderHomePage } from "@/features/builder";

export const metadata: Metadata = { title: "Builder" };

export default function BuilderPage() {
  return <BuilderHomePage />;
}
