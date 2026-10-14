import type { Metadata } from "next";
import { DashboardScreen } from "@/features/dashboard/components/DashboardScreen";

export const metadata: Metadata = { title: "Хяналтын самбар" };

export default function AdminPage() {
  return <DashboardScreen />;
}
