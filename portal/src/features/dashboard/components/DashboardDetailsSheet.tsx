"use client";

import { CircleDollarSign, ReceiptText, RefreshCw, Search, UsersRound, X } from "lucide-react";
import type { orders } from "@/api/generated/contracts";
import { formatMinor } from "@/api/generated/contracts/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { orderStatusLabels } from "@/features/orders/labels";
import { DASHBOARD_ALL_TRIPS, type DashboardSelection } from "../hooks/useDashboardScreen";

type Details = orders.OrderDashboardDetails;
type DetailItem = orders.OrderDashboardDetailItem;

const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Ulaanbaatar",
});

function formatDateTime(value: string) {
  const parts = new Map(
    dateTimeFormatter.formatToParts(new Date(value)).map((part) => [part.type, part.value]),
  );
  return `${parts.get("year") ?? ""}-${parts.get("month") ?? ""}-${parts.get("day") ?? ""} ${parts.get("hour") ?? ""}:${parts.get("minute") ?? ""}`;
}

function selectionCopy(selection: DashboardSelection, days: number) {
  if (selection.kind === "PENDING") {
    return {
      title: "Төлбөр хүлээгдэж байна",
      description: "Одоогоор төлбөр баталгаажаагүй бүх захиалга.",
    };
  }
  if (selection.kind === "PAID") {
    return {
      title: "Баталгаажсан захиалга",
      description: `Сүүлийн ${days} хоногт төлбөр баталгаажсан захиалгууд.`,
    };
  }
  if (selection.kind === "DAY") {
    return {
      title: selection.date,
      description: `${selection.date}-нд үүссэн болон төлбөр баталгаажсан захиалгууд.`,
    };
  }
  if (selection.kind === "TRIP") {
    return {
      title: selection.name,
      description: `Сүүлийн ${days} хоногийн захиалгын үзүүлэлт.`,
    };
  }
  return { title: "Захиалгын дэлгэрэнгүй", description: "" };
}

function SummaryCards({ data, mode }: { data: Details; mode: "PENDING" | "PAID" | "PERIOD" }) {
  const paidOnly = mode === "PAID";
  const pendingOnly = mode === "PENDING";
  const orderCount = paidOnly ? data.totalPaidOrders : data.totalOrders;
  const travelerCount = paidOnly ? data.totalPaidTravelers : data.totalTravelers;
  const amount = pendingOnly ? data.totalAmountMinor : data.paidRevenueMinor;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card size="sm">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription>
              {pendingOnly ? "Хүлээгдэж буй" : paidOnly ? "Баталгаажсан" : "Захиалга"}
            </CardDescription>
            <CardTitle className="mt-1 text-2xl tabular-nums">{orderCount}</CardTitle>
          </div>
          <ReceiptText className="size-4 text-muted-foreground" />
        </CardHeader>
      </Card>
      <Card size="sm">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription>Зорчигч</CardDescription>
            <CardTitle className="mt-1 text-2xl tabular-nums">{travelerCount}</CardTitle>
          </div>
          <UsersRound className="size-4 text-muted-foreground" />
        </CardHeader>
      </Card>
      <Card size="sm">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardDescription>
              {pendingOnly ? "Хүлээгдэж буй дүн" : "Төлөгдсөн орлого"}
            </CardDescription>
            <CardTitle className="mt-1 text-lg tabular-nums">{formatMinor(amount)}</CardTitle>
          </div>
          <CircleDollarSign className="size-4 text-muted-foreground" />
        </CardHeader>
      </Card>
    </div>
  );
}

function OrderList({
  title,
  items,
  hasMore,
  paidDate,
}: {
  title: string;
  items: DetailItem[];
  hasMore: boolean;
  paidDate?: boolean;
}) {
  const groups = new Map<string, DetailItem[]>();
  for (const item of items) {
    const group = groups.get(item.serviceName);
    if (group) group.push(item);
    else groups.set(item.serviceName, [item]);
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        {hasMore ? <span className="text-muted-foreground text-xs">Эхний 50 захиалга</span> : null}
      </div>
      {items.length ? (
        <div className="space-y-3">
          {[...groups.entries()].map(([serviceName, groupItems]) => {
            const travelerCount = groupItems.reduce(
              (total, order) => total + order.travelerCount,
              0,
            );
            const amountMinor = groupItems.reduce(
              (total, order) => total + order.totalPriceMinor,
              0,
            );

            return (
              <section key={serviceName} className="overflow-hidden rounded-xl border">
                <header className="flex flex-col gap-2 border-b bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h4 className="truncate font-semibold text-sm">{serviceName}</h4>
                    <p className="mt-0.5 text-muted-foreground text-xs tabular-nums">
                      {groupItems.length} захиалга · {travelerCount} зорчигч
                    </p>
                  </div>
                  <strong className="text-sm tabular-nums">{formatMinor(amountMinor)}</strong>
                </header>
                <div className="divide-y">
                  {groupItems.map((order) => (
                    <article key={order.id} className="space-y-2 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <strong className="truncate text-sm">{order.publicOrderId}</strong>
                          <Badge variant={order.status === "PAID" ? "secondary" : "outline"}>
                            {orderStatusLabels[order.status]}
                          </Badge>
                        </div>
                        <strong className="text-sm tabular-nums">
                          {formatMinor(order.totalPriceMinor)}
                        </strong>
                      </div>
                      <p className="text-muted-foreground text-xs">{order.customerName}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
                        <span>Аяллын огноо: {order.travelDate}</span>
                        <span className="tabular-nums">{order.travelerCount} зорчигч</span>
                        <time
                          dateTime={
                            (paidDate ? order.confirmedAt : order.createdAt) ?? order.createdAt
                          }
                        >
                          {paidDate && order.confirmedAt
                            ? `Баталгаажсан: ${formatDateTime(order.confirmedAt)}`
                            : `Үүссэн: ${formatDateTime(order.createdAt)}`}
                        </time>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed py-10 text-center text-muted-foreground text-sm">
          Харуулах захиалга алга.
        </p>
      )}
    </section>
  );
}

function DetailFilters({
  search,
  trip,
  trips,
  onSearchChange,
  onTripChange,
  onClear,
}: {
  search: string;
  trip: string;
  trips: string[];
  onSearchChange(value: string): void;
  onTripChange(value: string): void;
  onClear(): void;
}) {
  const active = search.trim().length > 0 || trip !== DASHBOARD_ALL_TRIPS;

  return (
    <div className="grid gap-2 rounded-xl border bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.65fr)_auto]">
      <label className="relative" htmlFor="dashboard-order-search">
        <span className="sr-only">Захиалга хайх</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="dashboard-order-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="bg-background pl-9"
          placeholder="Дугаар эсвэл захиалагч..."
        />
      </label>
      <Select value={trip} onValueChange={onTripChange}>
        <SelectTrigger className="w-full bg-background" aria-label="Аяллаар шүүх">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DASHBOARD_ALL_TRIPS}>Бүх аялал</SelectItem>
          {trips.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {active ? (
        <Button variant="outline" onClick={onClear}>
          <X /> Цэвэрлэх
        </Button>
      ) : null}
    </div>
  );
}

export function DashboardDetailsSheet({
  selection,
  days,
  data,
  loading,
  error,
  filterSearch,
  filterTrip,
  onRetry,
  onFilterSearchChange,
  onFilterTripChange,
  onClearFilters,
  onClose,
}: {
  selection: DashboardSelection | null;
  days: number;
  data: Details | undefined;
  loading: boolean;
  error: boolean;
  filterSearch: string;
  filterTrip: string;
  onRetry(): void;
  onFilterSearchChange(value: string): void;
  onFilterTripChange(value: string): void;
  onClearFilters(): void;
  onClose(): void;
}) {
  const copy = selection ? selectionCopy(selection, days) : null;
  const paidOnly = selection?.kind === "PAID";
  const pendingOnly = selection?.kind === "PENDING";
  const tripOptions = data
    ? selection?.kind === "PAID"
      ? data.paidTripOptions
      : selection?.kind === "DAY"
        ? [...new Set([...data.orderTripOptions, ...data.paidTripOptions])].sort((a, b) =>
            a.localeCompare(b, "mn"),
          )
        : data.orderTripOptions
    : [];

  return (
    <Sheet open={Boolean(selection)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl data-[side=right]:lg:max-w-3xl"
      >
        <SheetHeader className="border-b bg-muted/20 px-5 py-4 pr-12">
          <SheetTitle>{copy?.title ?? "Дэлгэрэнгүй"}</SheetTitle>
          <SheetDescription>{copy?.description}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
              <Skeleton className="h-80" />
            </div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
              <p className="font-medium">Дэлгэрэнгүй мэдээллийг ачаалж чадсангүй.</p>
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw /> Дахин ачаалах
              </Button>
            </div>
          ) : data && selection ? (
            <div className="space-y-6">
              <SummaryCards
                data={data}
                mode={pendingOnly ? "PENDING" : paidOnly ? "PAID" : "PERIOD"}
              />
              <DetailFilters
                search={filterSearch}
                trip={filterTrip}
                trips={tripOptions}
                onSearchChange={onFilterSearchChange}
                onTripChange={onFilterTripChange}
                onClear={onClearFilters}
              />
              {selection.kind === "DAY" ? (
                <>
                  <OrderList
                    title="Үүссэн захиалгууд"
                    items={data.orders}
                    hasMore={data.hasMoreOrders}
                  />
                  <OrderList
                    title="Баталгаажсан захиалгууд"
                    items={data.paidOrders}
                    hasMore={data.hasMorePaidOrders}
                    paidDate
                  />
                </>
              ) : paidOnly ? (
                <OrderList
                  title="Баталгаажсан захиалгууд"
                  items={data.paidOrders}
                  hasMore={data.hasMorePaidOrders}
                  paidDate
                />
              ) : pendingOnly ? (
                <OrderList
                  title="Төлбөр хүлээгдэж буй захиалгууд"
                  items={data.orders}
                  hasMore={data.hasMoreOrders}
                />
              ) : (
                <OrderList
                  title={selection.kind === "TRIP" ? "Аяллын захиалгууд" : "Захиалгууд"}
                  items={data.orders}
                  hasMore={data.hasMoreOrders}
                />
              )}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
