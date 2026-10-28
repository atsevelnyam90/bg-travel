"use client";

import {
  CalendarDays,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  MapPinned,
  RefreshCw,
} from "lucide-react";
import type { orders } from "@/api/generated/contracts";
import { formatMinor } from "@/api/generated/contracts/money";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardScreen } from "../hooks/useDashboardScreen";
import { DashboardDetailsSheet } from "./DashboardDetailsSheet";

type Daily = orders.OrderDashboard["daily"][number];

function DashboardLoading() {
  return (
    <div className="space-y-4">
      <span className="sr-only">Хяналтын самбар ачаалж байна</span>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

function DailyActivity({ daily, onSelect }: { daily: Daily[]; onSelect(date: string): void }) {
  const activeDays = daily.filter(
    (day) =>
      day.orders > 0 ||
      day.confirmedOrders > 0 ||
      day.pendingOrders > 0 ||
      day.paidRevenueMinor > 0,
  );

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Өдөр тутмын үзүүлэлт</CardTitle>
        <CardDescription>
          Шинэ захиалгыг үүссэн өдрөөр, баталгаажуулалт болон орлогыг төлбөр баталгаажсан өдрөөр
          тооцов. Хүлээгдэж буй захиалга үүссэн өдрөөрөө харагдана.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="hidden grid-cols-[6.5rem_4rem_6.5rem_6.5rem_minmax(0,1fr)_1rem] gap-3 border-b pb-3 text-muted-foreground text-xs font-medium sm:grid">
          <span>Огноо</span>
          <span>Шинэ</span>
          <span>Баталгаажсан</span>
          <span>Хүлээгдэж буй</span>
          <span className="text-right">Орлого</span>
          <span />
        </div>
        {activeDays.length ? (
          <ol className="divide-y">
            {[...activeDays].reverse().map((day) => (
              <li key={day.date}>
                <button
                  type="button"
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 rounded-md py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[6.5rem_4rem_6.5rem_6.5rem_minmax(0,1fr)_1rem] sm:items-center sm:gap-3"
                  onClick={() => onSelect(day.date)}
                  aria-label={`${day.date} өдрийн дэлгэрэнгүй`}
                >
                  <time dateTime={day.date} className="font-medium text-sm">
                    {day.date}
                  </time>
                  <span className="hidden text-sm tabular-nums sm:block">{day.orders}</span>
                  <span className="hidden text-sm tabular-nums sm:block">
                    {day.confirmedOrders}
                  </span>
                  <span className="hidden text-sm tabular-nums sm:block">{day.pendingOrders}</span>
                  <span className="text-right font-medium text-sm tabular-nums">
                    {formatMinor(day.paidRevenueMinor)}
                  </span>
                  <ChevronRight className="hidden size-4 text-muted-foreground sm:block" />
                  <span className="col-span-2 text-muted-foreground text-xs sm:hidden">
                    Шинэ {day.orders} · Баталгаажсан {day.confirmedOrders} · Хүлээгдэж буй{" "}
                    {day.pendingOrders}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="py-10 text-center text-muted-foreground text-sm">Одоогоор мэдээлэл алга.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardScreen() {
  const screen = useDashboardScreen();
  const data = screen.dashboard.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Хяналтын самбар"
        description={
          data
            ? `Сонгосон ${screen.days} хоногт ${data.totalOrders} шинэ захиалга · ${data.totalTravelers} зорчигч.`
            : "Захиалгын төлөв, орлого болон эрэлттэй аяллын тойм."
        }
        actions={
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Хугацаа</span>
            <Select value={String(screen.days)} onValueChange={screen.selectDays}>
              <SelectTrigger aria-label="Хяналтын самбарын хугацаа" className="min-w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 хоног</SelectItem>
                <SelectItem value="14">14 хоног</SelectItem>
                <SelectItem value="30">30 хоног</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {screen.dashboard.isLoading ? (
        <DashboardLoading />
      ) : screen.dashboard.isError ? (
        <Card className="border-destructive/40 shadow-xs">
          <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
            <p className="font-medium">Хяналтын самбарын мэдээллийг ачаалж чадсангүй.</p>
            <p className="text-muted-foreground text-sm">Холболтоо шалгаад дахин оролдоно уу.</p>
            <Button variant="outline" onClick={() => void screen.dashboard.refetch()}>
              <RefreshCw /> Дахин ачаалах
            </Button>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card
              data-size="sm"
              className="cursor-pointer border-primary/30 bg-primary/5 shadow-xs transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              role="button"
              tabIndex={0}
              aria-label="Төлбөр хүлээгдэж буй захиалгын дэлгэрэнгүй"
              onClick={screen.showPending}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  screen.showPending();
                }
              }}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardDescription>Төлбөр хүлээгдэж байна</CardDescription>
                  <CardTitle className="text-3xl tabular-nums">{data.pending.orderCount}</CardTitle>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-background">
                  <Clock3 className="size-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium tabular-nums">
                  {data.pending.travelerCount} зорчигч · {formatMinor(data.pending.amountMinor)}
                </p>
                <p className="text-muted-foreground">
                  {data.pending.oldestCreatedAt
                    ? `Хамгийн хуучин: ${data.pending.oldestCreatedAt.slice(0, 10)}`
                    : "Хүлээгдэж буй захиалга алга."}
                </p>
              </CardContent>
            </Card>
            <Card
              data-size="sm"
              className="cursor-pointer shadow-xs transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              role="button"
              tabIndex={0}
              aria-label="Баталгаажсан захиалгын дэлгэрэнгүй"
              onClick={screen.showPaid}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  screen.showPaid();
                }
              }}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardDescription>Баталгаажсан</CardDescription>
                  <CardTitle className="text-3xl tabular-nums">
                    {data.confirmed.orderCount}
                  </CardTitle>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                  <CircleCheckBig className="size-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium tabular-nums">
                  {data.confirmed.travelerCount} зорчигч ·{" "}
                  {formatMinor(data.confirmed.revenueMinor)}
                </p>
                <p className="text-muted-foreground">Сонгосон {screen.days} хоногт</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
            <DailyActivity daily={data.daily} onSelect={screen.showDay} />
            <Card className="shadow-xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPinned className="size-5 text-muted-foreground" />
                  Эрэлттэй аяллууд
                </CardTitle>
                <CardDescription>Зорчигчийн тоогоор эрэмбэлэв.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.topTrips.length ? (
                  <ol className="divide-y border-t">
                    {data.topTrips.map((trip, index) => (
                      <li key={trip.travelId}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 rounded-md py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => screen.showTrip(trip.travelId, trip.name)}
                          aria-label={`${trip.name} аяллын дэлгэрэнгүй`}
                        >
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs tabular-nums">
                            {index + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium text-sm">
                            {trip.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm tabular-nums">
                            <CalendarDays className="size-4 text-muted-foreground" />
                            {trip.travelerCount}
                          </span>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </button>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="py-10 text-center text-muted-foreground text-sm">
                    Одоогоор аяллын захиалга алга.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
      <DashboardDetailsSheet
        selection={screen.selection}
        days={screen.days}
        data={screen.details.data}
        loading={screen.details.isPending}
        error={screen.details.isError}
        filterSearch={screen.detailSearch}
        filterTrip={screen.detailTrip}
        onRetry={() => void screen.details.refetch()}
        onFilterSearchChange={screen.setDetailSearch}
        onFilterTripChange={screen.setDetailTrip}
        onClearFilters={screen.clearDetailFilters}
        onClose={screen.closeDetails}
      />
    </div>
  );
}
