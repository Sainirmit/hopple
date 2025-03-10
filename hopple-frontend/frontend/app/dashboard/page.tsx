"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  Cpu,
  FileText,
  FolderKanban,
  LineChart,
  MoreHorizontal,
  Plus,
  Settings,
  TrendingUp,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProjectCard } from "@/components/project-card";
import { AgentCard } from "@/components/agent-card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("projects");

  // Read the tab parameter from the URL when the component mounts
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["projects", "analytics", "agents"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Welcome back, John</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard?timeframe=today">
                    <Calendar className="mr-2 h-4 w-4" />
                    Today
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard?timeframe=week">
                    <Clock className="mr-2 h-4 w-4" />
                    This Week
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Projects
                  </CardTitle>
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Tasks
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">248</div>
                  <p className="text-xs text-muted-foreground">
                    36 due within 7 days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Team Utilization
                  </CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <Progress value={87} className="h-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    AI Agent Activity
                  </CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4/4</div>
                  <p className="text-xs text-muted-foreground">
                    All agents active
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="agents">AI Agents</TabsTrigger>
                </TabsList>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90"
                  asChild
                >
                  <Link href="/projects/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Link>
                </Button>
              </div>

              <TabsContent value="projects" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <ProjectCard
                    title="Website Redesign"
                    description="Modernize company website with new branding"
                    progress={75}
                    dueDate="Mar 15, 2025"
                    tasks={{ completed: 18, total: 24 }}
                    members={[
                      {
                        name: "Alex",
                        image: "/placeholder.svg?height=40&width=40",
                      },
                      {
                        name: "Sarah",
                        image: "/placeholder.svg?height=40&width=40",
                      },
                      {
                        name: "Mike",
                        image: "/placeholder.svg?height=40&width=40",
                      },
                    ]}
                    agentStatus="active"
                  />
                  <ProjectCard
                    title="Mobile App Development"
                    description="Create iOS and Android apps for customers"
                    progress={45}
                    dueDate="Apr 30, 2025"
                    tasks={{ completed: 12, total: 32 }}
                    members={[
                      {
                        name: "Jane",
                        image: "/placeholder.svg?height=40&width=40",
                      },
                      {
                        name: "Tom",
                        image: "/placeholder.svg?height=40&width=40",
                      },
                      {
                        name: "Lisa",
                        image: "/placeholder.svg?height=40&width=40",
                      },
                      {
                        name: "David",
                        image: "/placeholder.svg?height=40&width=40",
                      },
                    ]}
                    agentStatus="active"
                  />
                  <ProjectCard
                    title="Marketing Campaign"
                    description="Q2 product launch marketing strategy"
                    progress={20}
                    dueDate="May 10, 2025"
                    tasks={{ completed: 5, total: 18 }}
                    members={[
                      {
                        name: "Emma",
                        image: "/placeholder.svg?height=40&width=40",
                      },
                      {
                        name: "John",
                        image: "/placeholder.svg?height=40&width=40",
                      },
                    ]}
                    agentStatus="active"
                  />
                </div>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link href="/projects">
                    View All Projects
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Completion Rates</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80 flex items-center justify-center">
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        <BarChart3 className="h-16 w-16 mb-4" />
                        <p>Analytics chart will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Productivity</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80 flex items-center justify-center">
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        <LineChart className="h-16 w-16 mb-4" />
                        <p>Productivity metrics will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Project Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { project: "Website Redesign", rate: 92 },
                          { project: "Mobile App Development", rate: 78 },
                          { project: "Marketing Campaign", rate: 85 },
                          { project: "CRM Implementation", rate: 62 },
                        ].map((item, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {item.project}
                              </span>
                              <span
                                className={
                                  item.rate > 80
                                    ? "text-emerald-500"
                                    : item.rate > 60
                                    ? "text-amber-500"
                                    : "text-destructive"
                                }
                              >
                                {item.rate}%
                              </span>
                            </div>
                            <Progress value={item.rate} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="agents" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <AgentCard
                    name="Task Creator"
                    description="Generates tasks from project requirements"
                    status="Active"
                    activity="Generated 8 tasks today"
                    performance={92}
                  />
                  <AgentCard
                    name="Prioritizer"
                    description="Organizes tasks by importance and deadline"
                    status="Active"
                    activity="Reprioritized 15 tasks"
                    performance={88}
                  />
                  <AgentCard
                    name="Worker Assigner"
                    description="Matches team members to appropriate tasks"
                    status="Active"
                    activity="Assigned 12 tasks to team"
                    performance={85}
                  />
                  <AgentCard
                    name="Meeting Summarizer"
                    description="Creates summaries and action items from meetings"
                    status="Active"
                    activity="Summarized 3 meetings"
                    performance={90}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Recent Activity</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/activity">
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex items-center gap-4 p-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32`}
                        />
                        <AvatarFallback>U{item}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {
                            [
                              "Sarah completed task",
                              "AI created 3 new tasks",
                              "Mike updated project status",
                              "Emma assigned task to John",
                              "AI reprioritized tasks",
                            ][item - 1]
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {
                            [
                              "10 minutes ago",
                              "25 minutes ago",
                              "1 hour ago",
                              "3 hours ago",
                              "5 hours ago",
                            ][item - 1]
                          }
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
