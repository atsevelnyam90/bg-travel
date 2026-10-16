import type { Metadata } from "next";
import { BUILDER_RUNTIME_IDS } from "@/features/builder/runtimeIds";
import { OrderBuilderView } from "@/features/orders/components/OrderBuilderView";

export const metadata: Metadata = { title: "Захиалга" };

export default function AdminOrdersPage() {
  return <OrderBuilderView viewId={BUILDER_RUNTIME_IDS.orderView} />;
}
