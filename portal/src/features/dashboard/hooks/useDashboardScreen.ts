"use client";

import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useState } from "react";
import type { orders } from "@/api/generated/contracts";
import { getOrderDashboard, getOrderDashboardDetails } from "@/features/orders/api";

export type DashboardSelection =
  | { kind: "PENDING" }
  | { kind: "PAID" }
  | { kind: "DAY"; date: string }
  | { kind: "TRIP"; travelId: string; name: string };

export const DASHBOARD_ALL_TRIPS = "__all__";

export function useDashboardScreen() {
  const [days, setDays] = useState<orders.OrderDashboard["days"]>(7);
  const [selection, setSelection] = useState<DashboardSelection | null>(null);
  const [detailSearch, setDetailSearch] = useState("");
  const [detailTrip, setDetailTrip] = useState(DASHBOARD_ALL_TRIPS);
  const deferredDetailSearch = useDeferredValue(detailSearch.trim());
  const dashboard = useQuery({
    queryKey: ["orders", "dashboard", days],
    queryFn: ({ signal }) => getOrderDashboard(days, signal),
    refetchInterval: 30_000,
  });
  const details = useQuery({
    queryKey: ["orders", "dashboard-details", days, selection, deferredDetailSearch, detailTrip],
    queryFn: ({ signal }) =>
      getOrderDashboardDetails(
        {
          days,
          scope: selection?.kind === "PENDING" ? "PENDING_ALL" : "PERIOD",
          ...(selection?.kind === "DAY" ? { date: selection.date } : {}),
          ...(selection?.kind === "TRIP" ? { travelId: selection.travelId } : {}),
          ...(deferredDetailSearch ? { search: deferredDetailSearch } : {}),
          ...(detailTrip !== DASHBOARD_ALL_TRIPS ? { travelName: detailTrip } : {}),
        },
        signal,
      ),
    enabled: Boolean(selection),
  });
  const selectDays = (value: string) => {
    const next = Number(value);
    if (next === 7 || next === 14 || next === 30) {
      setDays(next);
      setSelection(null);
      setDetailSearch("");
      setDetailTrip(DASHBOARD_ALL_TRIPS);
    }
  };
  const selectDetails = (next: DashboardSelection | null) => {
    setDetailSearch("");
    setDetailTrip(DASHBOARD_ALL_TRIPS);
    setSelection(next);
  };

  return {
    days,
    selectDays,
    dashboard,
    details,
    selection,
    detailSearch,
    detailTrip,
    setDetailSearch,
    setDetailTrip,
    clearDetailFilters: () => {
      setDetailSearch("");
      setDetailTrip(DASHBOARD_ALL_TRIPS);
    },
    showPending: () => selectDetails({ kind: "PENDING" }),
    showPaid: () => selectDetails({ kind: "PAID" }),
    showDay: (date: string) => selectDetails({ kind: "DAY", date }),
    showTrip: (travelId: string, name: string) => selectDetails({ kind: "TRIP", travelId, name }),
    closeDetails: () => selectDetails(null),
  };
}
