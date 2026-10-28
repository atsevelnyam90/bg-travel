import type { orders } from "@/api/generated/contracts";

type OrderStatus = orders.AdminOrder["status"];

export const orderStatusLabels = {
  AWAITING_PAYMENT: "Төлбөр хүлээгдэж байна",
  PAID: "Төлөгдсөн",
} satisfies Record<OrderStatus, string>;

export const orderStatusOptions = [
  { value: "AWAITING_PAYMENT", label: orderStatusLabels.AWAITING_PAYMENT },
  { value: "PAID", label: orderStatusLabels.PAID },
] satisfies Array<{ value: OrderStatus; label: string }>;
