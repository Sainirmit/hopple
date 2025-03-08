import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  ChevronRight,
  Clock,
  Cpu,
  FileText,
  FolderKanban,
  MoreHorizontal,
  Plus,
  Settings,
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectCard } from "@/components/project-card"
import { AgentCard } from "@/components/agent-card"
import { TaskList } from "@/components/task-list"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Welcome back, John</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Today
                </Button>
                <Button variant="outline" size="sm">
                  <Clock className="mr-2 h-4 w-4" />
                  This Week
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">36</div>
                  <p className="text-xs text-muted-foreground">8 due today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <Progress value={87} className="h-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Agent Activity</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4/4</div>
                  <p className="text-xs text-muted-foreground">All agents active</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <Tabs defaultValue="projects" className="w-full">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="agents">AI Agents</TabsTrigger>
                </TabsList>
                <Button size="sm" className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90" asChild>
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
                      { name: "Alex", image: "/placeholder.svg?height=40&width=40" },
                      { name: "Sarah", image: "/placeholder.svg?height=40&width=40" },
                      { name: "Mike", image: "/placeholder.svg?height=40&width=40" },
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
                      { name: "Jane", image: "/placeholder.svg?height=40&width=40" },
                      { name: "Tom", image: "/placeholder.svg?height=40&width=40" },
                      { name: "Lisa", image: "/placeholder.svg?height=40&width=40" },
                      { name: "David", image: "/placeholder.svg?height=40&width=40" },
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
                      { name: "Emma", image: "/placeholder.svg?height=40&width=40" },
                      { name: "John", image: "/placeholder.svg?height=40&width=40" },
                    ]}
                    agentStatus="active"
                  />
                </div>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link href="/projects/website-redesign">
                    View All Projects
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </TabsContent>

              <TabsContent value="tasks" className="mt-6">
                <TaskList />
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
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex items-center gap-4 p-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
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
                          {["10 minutes ago", "25 minutes ago", "1 hour ago", "3 hours ago", "5 hours ago"][item - 1]}
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
  )
}

