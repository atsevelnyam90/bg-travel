import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Нэвтрэх" };

export default function LoginPage() {
  return <LoginForm />;
}
