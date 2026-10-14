import type { Metadata } from "next";
import { BlackTomatoPage } from "@/features/blacktomato/components/BlackTomatoPage";

export const metadata: Metadata = {
  title: "Luxury Travel & Bespoke Holidays | Black Tomato",
  description:
    "Award-winning luxury travel planners crafting bespoke holidays worldwide since 2005.",
};

export default function HomePage() {
  return <BlackTomatoPage />;
}
