import type { ReactNode } from "react";
import { BlackTomatoPublicLayout } from "@/features/blacktomato/components/BlackTomatoPublicLayout";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <BlackTomatoPublicLayout>{children}</BlackTomatoPublicLayout>;
}
