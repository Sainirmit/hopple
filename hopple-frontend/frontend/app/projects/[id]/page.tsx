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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Cpu,
  Download,
  FileText,
  MessageSquare,
  MoreHorizontal,
  PenSquare,
  Plus,
  Users,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { TaskList } from "@/components/task-list";

// Define the correct type for the page props
type Props = {
  params: {
    id: string;
  };
};

export default function ProjectDetailPage({ params }: Props) {
  // This would normally be fetched from an API based on the ID
  const project = {
    id: params.id,
    title: "Website Redesign",
    description:
      "Modernize company website with new branding and improved user experience",
    progress: 68,
    startDate: "Feb 01, 2025",
    dueDate: "Mar 15, 2025",
    tasks: {
      completed: 17,
      total: 25,
    },
    status: "In Progress",
    priority: "High",
    objectiveText:
      "Create a modern, responsive website with improved user flows, faster load times, and optimized conversion paths to increase traffic by 30% and conversion rates by 15% within 2 months of launch.",
    members: [
      {
        name: "Sarah Wilson",
        role: "Designer",
        image: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Mike Johnson",
        role: "Developer",
        image: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Alex Brown",
        role: "QA Tester",
        image: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Emma Davis",
        role: "Content Writer",
        image: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "John Smith",
        role: "Project Manager",
        image: "/placeholder.svg?height=40&width=40",
      },
    ],
    aiInsights: [
      "Tasks are being completed 15% faster than similar previous projects",
      "Critical path tasks are on schedule, with 3 days of buffer remaining",
      "Consider allocating more resources to the design phase to prevent bottlenecks",
    ],
  };

  // Calculate days remaining
  const due = new Date(project.dueDate);
  const today = new Date();
  const daysRemaining = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate time elapsed
  const start = new Date(project.startDate);
  const totalDays = Math.ceil(
    (due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsedDays = Math.ceil(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const timeElapsedPercent = Math.min(
    100,
    Math.max(0, (elapsedDays / totalDays) * 100)
  );

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <main className="flex-1 p-6">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </a>
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Project Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline">
                <PenSquare className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Project Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{project.progress}%</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    {timeElapsedPercent.toFixed(0)}% of time elapsed
                  </div>
                </div>
                <Progress value={project.progress} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Start: {project.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Due: {project.dueDate}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Badge
                    variant="outline"
                    className="bg-blue-500/20 text-blue-500 border-blue-500/50"
                  >
                    {daysRemaining} days remaining
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-purple-500/20 text-purple-500 border-purple-500/50"
                  >
                    {project.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {project.tasks.completed}/{project.tasks.total}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">
                    {(
                      (project.tasks.completed / project.tasks.total) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
                <Progress
                  value={(project.tasks.completed / project.tasks.total) * 100}
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6E2CF4] to-[#FF2B8F]">
                    <Cpu className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Active</div>
                    <div className="text-xs text-muted-foreground">
                      All agents running
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Project Objective</CardTitle>
                    <CardDescription>
                      The main goals and deliverables
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{project.objectiveText}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Insights</CardTitle>
                    <CardDescription>
                      Generated from project data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.aiInsights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#6E2CF4]">
                          <Cpu className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Team</CardTitle>
                    <CardDescription>Project members and roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.members.map((member, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={member.image}
                                alt={member.name}
                              />
                              <AvatarFallback>{member.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {member.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {member.role}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest updates and changes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          user: "AI Task Creator",
                          action: "created 3 new tasks",
                          time: "10 minutes ago",
                          ai: true,
                        },
                        {
                          user: "Sarah Wilson",
                          action: "completed the homepage wireframe task",
                          time: "1 hour ago",
                          ai: false,
                        },
                        {
                          user: "John Smith",
                          action: "updated the project timeline",
                          time: "3 hours ago",
                          ai: false,
                        },
                        {
                          user: "AI Meeting Summarizer",
                          action: "generated notes from design review",
                          time: "yesterday at 2:30 PM",
                          ai: true,
                        },
                        {
                          user: "Mike Johnson",
                          action: "commented on navigation component task",
                          time: "yesterday at 11:05 AM",
                          ai: false,
                        },
                      ].map((activity, i) => (
                        <div key={i} className="flex items-start gap-3">
                          {activity.ai ? (
                            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6E2CF4] to-[#FF2B8F]">
                              <Cpu className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src="/placeholder.svg?height=32&width=32"
                                alt={activity.user}
                              />
                              <AvatarFallback>
                                {activity.user[0]}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">
                                {activity.user}
                              </span>{" "}
                              {activity.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Project Tasks</CardTitle>
                    <CardDescription>
                      Manage and track all project tasks
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <TaskList projectId={params.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Project team and their roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {project.members.map((member, i) => (
                      <Card key={i}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center">
                            <Avatar className="h-16 w-16 mb-4">
                              <AvatarImage
                                src={member.image}
                                alt={member.name}
                              />
                              <AvatarFallback className="text-lg">
                                {member.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <h3 className="text-lg font-semibold">
                              {member.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {member.role}
                            </p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                              </Button>
                              <Button variant="outline" size="sm">
                                <Users className="mr-2 h-4 w-4" />
                                Profile
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Card className="flex h-[196px] flex-col items-center justify-center border-dashed">
                      <div className="flex flex-col items-center text-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="mb-3 h-10 w-10 rounded-full"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                        <h3 className="text-lg font-semibold">
                          Add Team Member
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Invite someone to the project
                        </p>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Documents</CardTitle>
                  <CardDescription>
                    Files and resources for this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-12">
                    Document section coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                  <CardDescription>
                    Gantt chart and milestone tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-12">
                    Timeline visualization coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Settings</CardTitle>
                  <CardDescription>
                    Manage project configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-12">
                    Settings panel coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
