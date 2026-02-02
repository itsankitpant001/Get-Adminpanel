"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import {
  Box,
  LayoutDashboard,
  Settings2,
  Smartphone,
  Tags,
  BarChart3,
  Briefcase,
  MonitorSmartphone,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@getgrip.com",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Products",
      url: "/products",
      icon: Smartphone,
      items: [
        {
          title: "All Products",
          url: "/products",
        },
        {
          title: "Add New",
          url: "/products/add",
        },
      ],
    },
    {
      title: "Brands",
      url: "/brands",
      icon: Briefcase,
      items: [
        {
          title: "All Brands",
          url: "/brands",
        },
        {
          title: "Add New",
          url: "/brands/add",
        },
      ],
    },
    {
      title: "Phone Models",
      url: "/phone-models",
      icon: MonitorSmartphone,
      items: [
        {
          title: "All Models",
          url: "/phone-models",
        },
        {
          title: "Add New",
          url: "/phone-models/add",
        },
      ],
    },
    {
      title: "Categories",
      url: "/categories",
      icon: Tags,
      items: [
        {
          title: "All Categories",
          url: "/categories",
        },
        {
          title: "Add New",
          url: "/categories/add",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
      items: [
        {
          title: "Overview",
          url: "/analytics",
        },
        {
          title: "Top Products",
          url: "/analytics/top-products",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  onLogout?: () => void
}

export function AppSidebar({ user, onLogout, ...props }: AppSidebarProps) {
  const displayUser = user || data.user

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Box className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">GetGrip</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
