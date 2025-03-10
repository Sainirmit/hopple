"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { ChevronLeft, Bell } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationsPage() {
  // Sample notifications data
  const notifications = [
    {
      id: 1,
      content: "AI has created 3 new tasks for Website Redesign",
      time: "Just now",
      read: false,
      type: "ai",
    },
    {
      id: 2,
      content: "Sarah completed the homepage design task",
      time: "10 minutes ago",
      read: false,
      type: "task",
    },
    {
      id: 3,
      content: "Team meeting scheduled for tomorrow at 10 AM",
      time: "1 hour ago",
      read: false,
      type: "meeting",
    },
    {
      id: 4,
      content:
        "Alex commented on your task: 'Looking good, but could use more contrast'",
      time: "2 hours ago",
      read: true,
      type: "comment",
    },
    {
      id: 5,
      content: "Mobile App Development project status updated to 45% complete",
      time: "3 hours ago",
      read: true,
      type: "update",
    },
    {
      id: 6,
      content: "Marketing Campaign deadline changed to May 15, 2025",
      time: "5 hours ago",
      read: true,
      type: "update",
    },
    {
      id: 7,
      content: "AI Prioritizer has reorganized your tasks for this week",
      time: "8 hours ago",
      read: true,
      type: "ai",
    },
    {
      id: 8,
      content: "Weekly report for Website Redesign is now available",
      time: "Yesterday",
      read: true,
      type: "report",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <main className="flex-1 p-6">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">
                  Stay updated with project activities and tasks
                </p>
              </div>
            </div>
            <Button size="sm">Mark all as read</Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="ai">AI Updates</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Notifications</CardTitle>
                  <CardDescription>
                    View all your recent notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 border rounded-lg ${
                          !notification.read ? "bg-muted/40" : ""
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40`}
                          />
                          <AvatarFallback>N</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p
                            className={`text-sm ${
                              !notification.read ? "font-medium" : ""
                            }`}
                          >
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unread" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Unread Notifications</CardTitle>
                  <CardDescription>
                    Notifications you haven't read yet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications
                      .filter((n) => !n.read)
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-start gap-4 p-4 border rounded-lg bg-muted/40"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={`/placeholder.svg?height=40&width=40`}
                            />
                            <AvatarFallback>N</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {notification.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Updates</CardTitle>
                  <CardDescription>
                    Notifications from AI agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications
                      .filter((n) => n.type === "ai")
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-4 p-4 border rounded-lg ${
                            !notification.read ? "bg-muted/40" : ""
                          }`}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={`/placeholder.svg?height=40&width=40`}
                            />
                            <AvatarFallback>N</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p
                              className={`text-sm ${
                                !notification.read ? "font-medium" : ""
                              }`}
                            >
                              {notification.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Notifications</CardTitle>
                  <CardDescription>
                    Updates related to your tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications
                      .filter((n) => n.type === "task" || n.type === "comment")
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-4 p-4 border rounded-lg ${
                            !notification.read ? "bg-muted/40" : ""
                          }`}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={`/placeholder.svg?height=40&width=40`}
                            />
                            <AvatarFallback>N</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p
                              className={`text-sm ${
                                !notification.read ? "font-medium" : ""
                              }`}
                            >
                              {notification.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
