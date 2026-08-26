"use client";

import { Command, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { brand } from "@/config/brand";
import { navSections } from "@/config/nav";
import { Can } from "@/features/auth";
import { UserMenu } from "./UserMenu";
import { useVisibleNav } from "./useVisibleNav";

export function AppSidebar() {
  const pathname = usePathname();
  const sections = useVisibleNav(navSections);

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <Command />
                <span className="font-semibold text-base">{brand.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem className="flex items-center gap-2">
                <Can do="product:write">
                  <SidebarMenuButton
                    asChild
                    tooltip="Бараа нэмэх"
                    className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                  >
                    <Link href="/products">
                      <PlusCircle />
                      <span>Шинээр нэмэх</span>
                    </Link>
                  </SidebarMenuButton>
                </Can>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {sections.map((section, index) => (
          <SidebarGroup key={section.label ?? `section-${index}`}>
            {section.label ? (
              <SidebarGroupLabel className="group-data-[collapsible=icon]:pointer-events-none">
                {section.label}
              </SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.children?.length ? (
                      <SidebarMenuSub>
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={
                                pathname === child.href || pathname.startsWith(`${child.href}/`)
                              }
                            >
                              <Link href={child.href}>
                                <child.icon />
                                <span>{child.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
