import type { Metadata } from "next";
import { TravelsScreen } from "@/features/travels/components/TravelsScreen";

export const metadata: Metadata = { title: "Аялал" };

export default function AdminTravelsPage() {
  return <TravelsScreen />;
}
