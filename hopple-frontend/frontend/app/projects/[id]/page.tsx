"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  Upload,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Info,
  Flag,
  Circle,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { TaskList } from "@/components/task-list";
import { TaskBoard } from "@/components/task-board";
import { AddTaskButton } from "@/components/add-task-button";
import { OrchestratorWorkflow } from "@/components/orchestrator-workflow";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// Define the correct type for the page props
type Props = {
  params: Promise<{
    id: string;
  }>;
};

// Define the expected shape of the params
interface RouteParams {
  id: string;
}

export default function ProjectDetailPage({ params }: Props) {
  // Unwrap params using React.use()
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;

  // Get query parameters to determine active tab
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update activeTab if the query parameter changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // This would normally be fetched from an API based on the ID
  const project = {
    id,
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
            <Link href="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
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
              <Button variant="outline" asChild>
                <Link href={`/projects/${id}/edit`}>
                  <PenSquare className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <AddTaskButton
                projectId={id}
                projectName={project.title}
                className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90"
              />
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
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
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
                    <AddTaskButton
                      projectId={id}
                      projectName={project.title}
                      size="sm"
                      className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90"
                      defaultStatus="To Do"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <TaskBoard projectId={id} projectName={project.title} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>
                        Project team and their roles
                      </CardDescription>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Team Member
                    </Button>
                  </div>
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
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Users className="mr-2 h-4 w-4" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove from Project
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Project Documents</CardTitle>
                      <CardDescription>
                        Files and resources for this project
                      </CardDescription>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90"
                      size="sm"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Document upload area */}
                    <div className="border-2 border-dashed rounded-lg p-10 text-center">
                      <div className="flex flex-col items-center">
                        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-1">
                          Upload Documents
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Drag and drop files here or click to browse
                        </p>
                        <Input
                          type="file"
                          className="hidden"
                          id="document-upload"
                          multiple
                        />
                        <Button size="sm" asChild>
                          <Label htmlFor="document-upload">Choose Files</Label>
                        </Button>
                      </div>
                    </div>

                    {/* Recent documents list */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">
                        Recent Documents
                      </h3>
                      <div className="space-y-2">
                        {[
                          {
                            name: "Project Proposal",
                            type: "PDF",
                            size: "2.4 MB",
                            date: "Mar 05, 2025",
                            owner: "John Smith",
                          },
                          {
                            name: "Design Assets",
                            type: "ZIP",
                            size: "34.2 MB",
                            date: "Mar 07, 2025",
                            owner: "Sarah Wilson",
                          },
                          {
                            name: "User Research",
                            type: "DOCX",
                            size: "1.8 MB",
                            date: "Mar 08, 2025",
                            owner: "Emma Davis",
                          },
                          {
                            name: "Meeting Notes",
                            type: "PDF",
                            size: "0.5 MB",
                            date: "Mar 09, 2025",
                            owner: "Mike Johnson",
                          },
                        ].map((doc, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-primary" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>
                                    {doc.type} • {doc.size}
                                  </span>
                                  <span>•</span>
                                  <span>Uploaded {doc.date}</span>
                                  <span>•</span>
                                  <span>by {doc.owner}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6 space-y-6">
              {/* Timeline content */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                  <CardDescription>
                    View the project schedule and milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Timeline visualization coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="mt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <OrchestratorWorkflow
                  projectId={id}
                  projectName={project.title}
                />

                <Card>
                  <CardHeader>
                    <CardTitle>AI Agents</CardTitle>
                    <CardDescription>
                      Specialized AI agents to help with your project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#6E2CF4]">
                        <Cpu className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm">
                        Project Manager Agent analyzes your project and
                        coordinates other agents
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#6E2CF4]">
                        <Cpu className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm">
                        Task Creator Agent breaks down requirements into
                        actionable tasks
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#6E2CF4]">
                        <Cpu className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm">
                        Worker Assignment Agent matches tasks to team members
                        based on skills
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6 space-y-6">
              {/* Settings content */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Settings</CardTitle>
                  <CardDescription>
                    Manage project configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Project Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Project Details</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input id="project-name" defaultValue={project.title} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="project-status">Status</Label>
                        <Input
                          id="project-status"
                          defaultValue={project.status}
                        />
                      </div>
                      <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="project-description">Description</Label>
                        <Textarea
                          id="project-description"
                          defaultValue={project.description}
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          defaultValue={project.startDate}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="due-date">Due Date</Label>
                        <Input id="due-date" defaultValue={project.dueDate} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Notifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="new-task">
                            New task notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when new tasks are created
                          </p>
                        </div>
                        <Switch id="new-task" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="task-updates">Task updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when tasks are updated
                          </p>
                        </div>
                        <Switch id="task-updates" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="milestone">Milestone alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when milestones are reached
                          </p>
                        </div>
                        <Switch id="milestone" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Danger Zone */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-destructive">
                      Danger Zone
                    </h3>
                    <div className="rounded-lg border border-destructive/50 p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">Archive Project</h4>
                          <p className="text-sm text-muted-foreground">
                            Archive this project to hide it from active projects
                            list
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Archive Project
                        </Button>
                      </div>
                      <Separator />
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-destructive">
                            Delete Project
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            This action cannot be undone. This will permanently
                            delete this project and all associated data.
                          </p>
                        </div>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Project
                        </Button>
                      </div>
                    </div>
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
