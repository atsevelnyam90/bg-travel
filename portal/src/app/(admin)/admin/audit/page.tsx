import type { Metadata } from "next";
import { AuditScreen } from "@/features/audit/components/AuditScreen";

export const metadata: Metadata = { title: "Аудит" };

export default function AuditPage() {
  return <AuditScreen />;
}
