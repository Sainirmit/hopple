"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  ChevronLeft,
  LineChart,
  Activity,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ActivityPage() {
  // Sample activity data
  const activities = [
    {
      id: 1,
      user: {
        name: "Sarah",
        initial: "S",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      action: "completed task",
      detail: "Homepage design mockup",
      project: "Website Redesign",
      time: "10 minutes ago",
      type: "task",
    },
    {
      id: 2,
      user: {
        name: "AI",
        initial: "AI",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      action: "created 3 new tasks",
      detail: "User profile page, Settings page, and Dashboard widgets",
      project: "Website Redesign",
      time: "25 minutes ago",
      type: "ai",
    },
    {
      id: 3,
      user: {
        name: "Mike",
        initial: "M",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      action: "updated project status",
      detail: "Changed project completion from 65% to 75%",
      project: "Website Redesign",
      time: "1 hour ago",
      type: "update",
    },
    {
      id: 4,
      user: {
        name: "Emma",
        initial: "E",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      action: "assigned task to John",
      detail: "Product page redesign",
      project: "Website Redesign",
      time: "3 hours ago",
      type: "assignment",
    },
    {
      id: 5,
      user: {
        name: "AI",
        initial: "AI",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      action: "reprioritized tasks",
      detail: "Adjusted 8 task priorities based on deadlines",
      project: "Website Redesign",
      time: "5 hours ago",
      type: "ai",
    },
    {
      id: 6,
      user: {
        name: "John",
        initial: "J",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      action: "commented on task",
      detail: "Added requirements clarification to homepage task",
      project: "Website Redesign",
      time: "Yesterday",
      type: "comment",
    },
    {
      id: 7,
      user: {
        name: "Tom",
        initial: "T",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      action: "created new task",
      detail: "API integration for user authentication",
      project: "Mobile App Development",
      time: "Yesterday",
      type: "task",
    },
    {
      id: 8,
      user: {
        name: "Lisa",
        initial: "L",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      action: "completed task",
      detail: "UI design for login screen",
      project: "Mobile App Development",
      time: "Yesterday",
      type: "task",
    },
    {
      id: 9,
      user: {
        name: "David",
        initial: "D",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      action: "added comments",
      detail: "Feedback on UI mockups",
      project: "Mobile App Development",
      time: "2 days ago",
      type: "comment",
    },
    {
      id: 10,
      user: {
        name: "Emma",
        initial: "E",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      action: "created marketing plan",
      detail: "Q2 social media strategy document",
      project: "Marketing Campaign",
      time: "2 days ago",
      type: "document",
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
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Activity Feed</h1>
                <p className="text-muted-foreground">
                  Track all activities across your projects
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="website">Website Redesign</SelectItem>
                  <SelectItem value="mobile">Mobile App Development</SelectItem>
                  <SelectItem value="marketing">Marketing Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Activity</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="ai">AI Actions</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Activity History</CardTitle>
                  <CardDescription>
                    View all activities across your projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/40 transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback>
                            {activity.user.initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium">
                              {activity.user.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.action}
                            </p>
                          </div>
                          <p className="text-sm font-medium mt-1">
                            {activity.detail}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {activity.project}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Activity</CardTitle>
                  <CardDescription>
                    Tasks created, assigned, and completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities
                      .filter(
                        (a) => a.type === "task" || a.type === "assignment"
                      )
                      .map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/40 transition-colors"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback>
                              {activity.user.initial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium">
                                {activity.user.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {activity.action}
                              </p>
                            </div>
                            <p className="text-sm font-medium mt-1">
                              {activity.detail}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {activity.project}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Actions</CardTitle>
                  <CardDescription>
                    Activities performed by AI agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities
                      .filter((a) => a.type === "ai")
                      .map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/40 transition-colors"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback>
                              {activity.user.initial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium">
                                {activity.user.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {activity.action}
                              </p>
                            </div>
                            <p className="text-sm font-medium mt-1">
                              {activity.detail}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {activity.project}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comments Activity</CardTitle>
                  <CardDescription>Comments and discussions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities
                      .filter((a) => a.type === "comment")
                      .map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/40 transition-colors"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback>
                              {activity.user.initial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium">
                                {activity.user.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {activity.action}
                              </p>
                            </div>
                            <p className="text-sm font-medium mt-1">
                              {activity.detail}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {activity.project}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
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
