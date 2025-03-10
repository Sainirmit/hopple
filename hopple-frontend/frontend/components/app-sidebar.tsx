"use client";

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
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronDown,
  Cpu,
  FolderKanban,
  HelpCircle,
  Home,
  LogOut,
  Plus,
  Settings,
  Users,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex flex-col items-center justify-center py-4 relative",
          isCollapsed && "items-center"
        )}
      >
        {/* Apple-style collapse indicator */}
        <div
          className={cn(
            "absolute right-[-10px] top-1/2 transform -translate-y-1/2 flex items-center justify-center",
            "w-5 h-14 rounded-r-md bg-background border-r border-y border-border/50",
            "cursor-pointer hover:bg-accent/30 transition-all duration-200",
            "shadow-sm"
          )}
          onClick={toggleSidebar}
        >
          <ChevronRight
            className={cn(
              "h-3 w-3 text-muted-foreground transition-transform duration-300",
              isCollapsed ? "" : "rotate-180"
            )}
          />
        </div>

        <Link href="/" className="flex items-center gap-2 mb-4">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6E2CF4] to-[#FF2B8F]">
            <Cpu className="h-4 w-4 text-white" />
          </div>
          <span
            className={cn(
              "text-lg font-semibold transition-opacity duration-200",
              isCollapsed ? "opacity-0 hidden" : "opacity-100"
            )}
          >
            Hopple
          </span>
        </Link>

        <div className={cn("w-full px-3", isCollapsed && "px-1.5")}>
          <Button
            variant="outline"
            className={cn(
              "w-full bg-gradient-to-r from-[#6E2CF4]/80 to-[#FF2B8F]/80 hover:from-[#6E2CF4] hover:to-[#FF2B8F] text-white border-0",
              "shadow-sm transition-all duration-200",
              isCollapsed ? "p-2 aspect-square" : "h-9"
            )}
            asChild
          >
            <Link
              href="/projects/new"
              className="flex items-center justify-center"
            >
              <Plus className="h-4 w-4" />
              <span
                className={
                  isCollapsed ? "sr-only" : "ml-1.5 text-sm font-medium"
                }
              >
                New Project
              </span>
            </Link>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="my-2" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive tooltip="Dashboard">
                  <Link href="/dashboard" className="flex items-center">
                    <Home />
                    <span className={isCollapsed ? "sr-only" : ""}>
                      Dashboard
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Projects">
                  <Link href="/projects" className="flex items-center">
                    <FolderKanban />
                    <span className={isCollapsed ? "sr-only" : ""}>
                      Projects
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Analytics">
                  <Link
                    href="/dashboard?tab=analytics"
                    className="flex items-center"
                  >
                    <BarChart3 />
                    <span className={isCollapsed ? "sr-only" : ""}>
                      Analytics
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Calendar">
                  <Link href="/calendar" className="flex items-center">
                    <Calendar />
                    <span className={isCollapsed ? "sr-only" : ""}>
                      Calendar
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Team">
                  <Link href="/team" className="flex items-center">
                    <Users />
                    <span className={isCollapsed ? "sr-only" : ""}>Team</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            AI Agents
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Task Creator">
                  <Link
                    href="/agents/task-creator"
                    className="flex items-center"
                  >
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#6E2CF4] to-[#FF2B8F]">
                      <Cpu className="h-3 w-3 text-white" />
                    </div>
                    <span className={isCollapsed ? "sr-only" : ""}>
                      Task Creator
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Prioritizer">
                  <Link
                    href="/agents/prioritizer"
                    className="flex items-center"
                  >
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#6E2CF4] to-[#FF2B8F]">
                      <Cpu className="h-3 w-3 text-white" />
                    </div>
                    <span className={isCollapsed ? "sr-only" : ""}>
                      Prioritizer
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Worker Assigner">
                  <Link
                    href="/agents/worker-assigner"
                    className="flex items-center"
                  >
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#6E2CF4] to-[#FF2B8F]">
                      <Cpu className="h-3 w-3 text-white" />
                    </div>
                    <span className={isCollapsed ? "sr-only" : ""}>
                      Worker Assigner
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Meeting Summarizer">
                  <Link
                    href="/agents/meeting-summarizer"
                    className="flex items-center"
                  >
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#6E2CF4] to-[#FF2B8F]">
                      <Cpu className="h-3 w-3 text-white" />
                    </div>
                    <span className={isCollapsed ? "sr-only" : ""}>
                      Meeting Summarizer
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings" className="flex items-center">
                <Settings />
                <span className={isCollapsed ? "sr-only" : ""}>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Help">
              <Link href="/help" className="flex items-center">
                <HelpCircle />
                <span className={isCollapsed ? "sr-only" : ""}>Help</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarSeparator />
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="User Profile">
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="User"
                    />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className={isCollapsed ? "sr-only" : ""}>John Doe</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4",
                      isCollapsed ? "hidden" : "ml-auto"
                    )}
                  />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings?tab=profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings?tab=account">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-destructive">
                  <Link href="/login">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
      <SidebarTrigger className="absolute right-4 top-4 md:hidden" />
    </Sidebar>
  );
}
