"use client";

import { CalendarDays, CircleDollarSign, MapPinned, RefreshCw, ShoppingCart } from "lucide-react";
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

function DailyActivity({ daily }: { daily: Daily[] }) {
  const activeDays = daily.filter((day) => day.orders > 0 || day.paidRevenueMinor > 0);

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Өдөр тутмын үзүүлэлт</CardTitle>
        <CardDescription>
          Захиалгыг үүссэн өдрөөр, орлогыг төлбөр баталгаажсан өдрөөр тооцов.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="hidden grid-cols-[6rem_6rem_minmax(0,1fr)] gap-3 border-b pb-3 text-muted-foreground text-xs font-medium sm:grid">
          <span>Огноо</span>
          <span>Захиалга</span>
          <span className="text-right">Төлөгдсөн орлого</span>
        </div>
        {activeDays.length ? (
          <ol className="divide-y">
            {[...activeDays].reverse().map((day) => (
              <li
                key={day.date}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 py-4 sm:grid-cols-[6rem_6rem_minmax(0,1fr)] sm:items-center sm:gap-3"
              >
                <time dateTime={day.date} className="font-medium text-sm">
                  {day.date}
                </time>
                <span className="text-right text-sm tabular-nums sm:text-left">
                  {day.orders}
                  <span className="ml-1 text-muted-foreground text-xs sm:sr-only">захиалга</span>
                </span>
                <span className="col-span-2 text-right font-medium text-sm tabular-nums sm:col-span-1">
                  {formatMinor(day.paidRevenueMinor)}
                </span>
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
        description="Захиалга, төлөгдсөн орлого болон эрэлттэй аяллын тойм."
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
            <Card data-size="sm" className="shadow-xs">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardDescription>Нийт захиалга</CardDescription>
                  <CardTitle className="text-3xl tabular-nums">{data.totalOrders}</CardTitle>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                  <ShoppingCart className="size-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Сонгосон хугацаанд үүссэн бүх захиалга
              </CardContent>
            </Card>
            <Card data-size="sm" className="shadow-xs">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardDescription>Төлөгдсөн орлого</CardDescription>
                  <CardTitle className="text-3xl tabular-nums">
                    {formatMinor(data.paidRevenueMinor)}
                  </CardTitle>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                  <CircleDollarSign className="size-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Төлбөр баталгаажсан захиалгын нийлбэр
              </CardContent>
            </Card>
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
            <DailyActivity daily={data.daily} />
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
                      <li key={trip.travelId} className="flex items-center gap-3 py-4">
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
    </div>
  );
}
