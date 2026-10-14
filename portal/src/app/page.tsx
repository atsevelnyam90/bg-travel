import type { Metadata } from "next";
import { BlackTomatoPage } from "@/features/blacktomato/components/BlackTomatoPage";

export const metadata: Metadata = {
  title: "BG Travel | Тээш дүүрэн дурсамж",
  description:
    "Тээш дүүрэн дурсамжийг BG Travel-тай хамт. Хамгийн хямд, хамгийн чанартай аяллыг манайхаас.",
};

export default function HomePage() {
  return <BlackTomatoPage />;
}
