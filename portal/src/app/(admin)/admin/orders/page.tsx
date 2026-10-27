import type { Metadata } from "next";
import { OrdersScreen } from "@/features/orders/components/OrdersScreen";

export const metadata: Metadata = { title: "Захиалга" };

export default function AdminOrdersPage() {
  return <OrdersScreen />;
}
