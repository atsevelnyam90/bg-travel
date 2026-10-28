"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { orders } from "@/api/generated/contracts";
import { getOrderDashboard } from "@/features/orders/api";

export function useDashboardScreen() {
  const [days, setDays] = useState<orders.OrderDashboard["days"]>(7);
  const dashboard = useQuery({
    queryKey: ["orders", "dashboard", days],
    queryFn: ({ signal }) => getOrderDashboard(days, signal),
    refetchInterval: 30_000,
  });
  const selectDays = (value: string) => {
    const next = Number(value);
    if (next === 7 || next === 14 || next === 30) setDays(next);
  };

  return { days, selectDays, dashboard };
}
