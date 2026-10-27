import type { Metadata } from "next";
import { UsersScreen } from "@/features/users/components/UsersScreen";

export const metadata: Metadata = { title: "Хэрэглэгч" };

export default function UsersPage() {
  return <UsersScreen />;
}
