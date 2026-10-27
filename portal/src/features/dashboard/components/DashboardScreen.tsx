"use client";

import {
  Activity,
  Building2,
  FileText,
  Package,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/features/auth";

export function DashboardScreen() {
  const { session } = useSession();
  const permissionCount = session?.permissions.length ?? 0;
  const modules = [
    { label: "Бараа", description: "Product CRUD, payment QR", icon: Package },
    { label: "Хэрэглэгч", description: "Invite, role-based access", icon: UserRound },
    { label: "Аудит", description: "Backend-owned activity log", icon: FileText },
    { label: "Тохиргоо", description: "Organization + payment account", icon: Settings },
  ];
  const metrics = [
    {
      label: "Workspace",
      value: session?.organization?.name ?? "Байгууллагагүй",
      description: "Одоогийн идэвхтэй байгууллага",
      icon: Building2,
    },
    {
      label: "Role",
      value: session?.role?.name ?? "Role тохируулаагүй",
      description: "Цэс болон үйлдлийн эрх эндээс шүүгдэнэ",
      icon: UserRound,
    },
    {
      label: "Permissions",
      value: permissionCount.toString(),
      description: "Session дээр ирсэн backend-owned эрх",
      icon: ShieldCheck,
    },
    {
      label: "Starter",
      value: "Ready",
      description: "Домэйн CRUD дэлгэцүүд ажиллахад бэлэн",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Хяналтын самбар"
        description="Workspace, role, permission-ийн одоогийн төлөв."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} data-size="sm" className="shadow-xs">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="space-y-1">
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="line-clamp-1 text-xl">{metric.value}</CardTitle>
              </div>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
                <metric.icon className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              {metric.description}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>ERP модулиуд</CardTitle>
          <CardDescription>Starter дээр бэлэн байгаа үндсэн screen-үүд.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {modules.map((module) => (
            <div key={module.label} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <module.icon className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium text-sm">{module.label}</div>
                <div className="truncate text-muted-foreground text-xs">{module.description}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Session & application readiness</CardTitle>
          <CardDescription>
            {session?.user.name} · {session?.user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">DataGrid pattern ready</Badge>
            <Badge variant="outline">Status filters ready</Badge>
            <Badge variant="outline">Row actions ready</Badge>
            <Badge variant="outline">Inter Cyrillic font</Badge>
          </div>
          <div className="space-y-2">
            <span className="text-muted-foreground">Эрх ({session?.permissions.length ?? 0}):</span>
            <div className="flex flex-wrap gap-1.5">
              {session?.permissions.map((permission) => (
                <Badge key={permission} variant="secondary">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
