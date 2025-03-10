"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpDown,
  Check,
  ChevronLeft,
  Cpu,
  History,
  LayoutList,
  Settings,
  Target,
  CheckCircle2,
  AlertCircle,
  CircleHelp,
  Clock,
  ArrowRight,
  ListFilter,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PrioritizerPage() {
  const [activeTab, setActiveTab] = useState("prioritize");
  const [selectedProject, setSelectedProject] = useState("");
  const [prioritizing, setPrioritizing] = useState(false);

  // Sample projects for selection
  const projects = [
    { id: "website-redesign", name: "Website Redesign" },
    { id: "mobile-app-development", name: "Mobile App Development" },
    { id: "marketing-campaign", name: "Marketing Campaign" },
    { id: "crm-implementation", name: "CRM Implementation" },
    { id: "product-roadmap", name: "Product Roadmap" },
  ];

  // Sample history data
  const historyData = [
    {
      id: 1,
      date: "Mar 09, 2025",
      project: "Website Redesign",
      tasksReprioritized: 14,
      status: "completed",
    },
    {
      id: 2,
      date: "Mar 07, 2025",
      project: "Mobile App Development",
      tasksReprioritized: 18,
      status: "completed",
    },
    {
      id: 3,
      date: "Mar 05, 2025",
      project: "Marketing Campaign",
      tasksReprioritized: 9,
      status: "completed",
    },
    {
      id: 4,
      date: "Mar 03, 2025",
      project: "Website Redesign",
      tasksReprioritized: 12,
      status: "completed",
    },
  ];

  // Sample prioritized tasks
  const prioritizedTasks = [
    {
      id: 1,
      title: "Fix critical payment gateway bug",
      priority: {
        before: "medium",
        after: "critical",
      },
      deadline: "Mar 12, 2025",
      assignee: {
        name: "Jane Smith",
        image: "/placeholder.svg?height=32&width=32",
      },
      reasoning: "Customer impact is significant; affects revenue generation",
    },
    {
      id: 2,
      title: "Update privacy policy for GDPR compliance",
      priority: {
        before: "low",
        after: "high",
      },
      deadline: "Mar 14, 2025",
      assignee: {
        name: "Tom Wilson",
        image: "/placeholder.svg?height=32&width=32",
      },
      reasoning: "Legal compliance requirement with upcoming deadline",
    },
    {
      id: 3,
      title: "Redesign product gallery carousel",
      priority: {
        before: "high",
        after: "medium",
      },
      deadline: "Mar 18, 2025",
      assignee: {
        name: "Sarah Wilson",
        image: "/placeholder.svg?height=32&width=32",
      },
      reasoning: "Dependency for other critical tasks has been resolved",
    },
    {
      id: 4,
      title: "Implement user authentication improvements",
      priority: {
        before: "medium",
        after: "high",
      },
      deadline: "Mar 15, 2025",
      assignee: {
        name: "Mike Johnson",
        image: "/placeholder.svg?height=32&width=32",
      },
      reasoning: "Security concern identified in recent audit",
    },
    {
      id: 5,
      title: "Add social media sharing buttons",
      priority: {
        before: "medium",
        after: "low",
      },
      deadline: "Mar 22, 2025",
      assignee: {
        name: "Emma Davis",
        image: "/placeholder.svg?height=32&width=32",
      },
      reasoning: "Non-essential feature with flexible deadline",
    },
  ];

  // Function to handle prioritization
  const handlePrioritize = () => {
    if (!selectedProject) return;

    setPrioritizing(true);

    // Simulate AI prioritization with a timeout
    setTimeout(() => {
      setPrioritizing(false);
    }, 3000);
  };

  // Helper to get priority badge and color
  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-500 text-white",
      high: "bg-amber-500 text-white",
      medium: "bg-blue-500 text-white",
      low: "bg-green-500 text-white",
    };

    return (
      <Badge className={colors[priority] || "bg-gray-500"}>{priority}</Badge>
    );
  };

  // Helper to get status icon
  const getStatusIcon = (status: string) => {
    const icons = {
      completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      processing: <Clock className="h-4 w-4 text-amber-500" />,
      failed: <AlertCircle className="h-4 w-4 text-red-500" />,
    };
    return (
      icons[status as keyof typeof icons] || (
        <CircleHelp className="h-4 w-4 text-gray-400" />
      )
    );
  };

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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#6E2CF4] to-[#FF2B8F]">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Prioritizer</h1>
                <p className="text-muted-foreground">
                  AI agent that optimizes task priorities based on project goals
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="w-fit bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400"
            >
              <Check className="mr-1 h-3 w-3" /> Active
            </Badge>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 md:w-auto">
              <TabsTrigger value="prioritize">
                <Target className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                <span className="hidden md:inline-block lg:inline-block">
                  Prioritize
                </span>
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                <span className="hidden md:inline-block lg:inline-block">
                  History
                </span>
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                <span className="hidden md:inline-block lg:inline-block">
                  Settings
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prioritize" className="mt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Prioritize Tasks</CardTitle>
                    <CardDescription>
                      Let AI optimize task priorities for your project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project">Project</Label>
                      <Select
                        value={selectedProject}
                        onValueChange={setSelectedProject}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Prioritization Factors</Label>
                      <div className="rounded-md border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="deadlines" className="text-sm">
                              Deadlines
                            </Label>
                            <CircleHelp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Switch id="deadlines" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="dependencies" className="text-sm">
                              Dependencies
                            </Label>
                            <CircleHelp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Switch id="dependencies" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Label
                              htmlFor="team-availability"
                              className="text-sm"
                            >
                              Team Availability
                            </Label>
                            <CircleHelp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Switch id="team-availability" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="business-value" className="text-sm">
                              Business Value
                            </Label>
                            <CircleHelp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Switch id="business-value" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90"
                      onClick={handlePrioritize}
                      disabled={prioritizing || !selectedProject}
                    >
                      {prioritizing ? (
                        <>
                          <Cpu className="mr-2 h-4 w-4 animate-pulse" />
                          Prioritizing...
                        </>
                      ) : (
                        <>
                          <ArrowUpDown className="mr-2 h-4 w-4" />
                          Prioritize Tasks
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle>Prioritization Results</CardTitle>
                    <CardDescription>
                      {selectedProject
                        ? `Task priorities for ${
                            projects.find((p) => p.id === selectedProject)?.name
                          }`
                        : "Select a project to see prioritized tasks"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedProject ? (
                      <div className="space-y-4">
                        {prioritizedTasks.map((task) => (
                          <div
                            key={task.id}
                            className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex flex-col gap-3">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold">{task.title}</h3>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm text-muted-foreground">
                                    {getPriorityBadge(task.priority.before)}
                                  </div>
                                  <ArrowRight className="h-4 w-4" />
                                  <div>
                                    {getPriorityBadge(task.priority.after)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>Due: {task.deadline}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage
                                      src={task.assignee.image}
                                      alt={task.assignee.name}
                                    />
                                    <AvatarFallback>
                                      {task.assignee.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{task.assignee.name}</span>
                                </div>
                              </div>

                              <div className="bg-muted/30 p-3 rounded text-sm">
                                <span className="font-medium">
                                  AI reasoning:{" "}
                                </span>
                                <span className="text-muted-foreground">
                                  {task.reasoning}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <ListFilter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">
                          No project selected
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Select a project and click "Prioritize Tasks" to
                          optimize task priorities
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prioritization History</CardTitle>
                  <CardDescription>
                    Previous prioritization runs and their results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {historyData.map((item) => (
                      <div
                        key={item.id}
                        className="border-b pb-6 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            <span className="font-medium">{item.project}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {item.date}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            <span className="font-medium">
                              {item.tasksReprioritized}
                            </span>{" "}
                            tasks reprioritized
                          </span>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prioritizer Settings</CardTitle>
                  <CardDescription>
                    Configure how the prioritization agent works
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Agent Status</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Agent Activation</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable or disable the agent
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Automatic Runs</Label>
                          <p className="text-sm text-muted-foreground">
                            Run prioritization automatically each day
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified about priority changes
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Prioritization Settings</h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Priority Levels</Label>
                        <Select defaultValue="4">
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of levels" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">
                              3 Levels (Low, Medium, High)
                            </SelectItem>
                            <SelectItem value="4">
                              4 Levels (Low, Medium, High, Critical)
                            </SelectItem>
                            <SelectItem value="5">
                              5 Levels (including Urgent)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Factor Weights</Label>
                        <div className="space-y-3 pt-2">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Deadline Proximity</span>
                              <span>40%</span>
                            </div>
                            <Progress value={40} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Business Impact</span>
                              <span>30%</span>
                            </div>
                            <Progress value={30} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Dependency Chains</span>
                              <span>20%</span>
                            </div>
                            <Progress value={20} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Resource Availability</span>
                              <span>10%</span>
                            </div>
                            <Progress value={10} className="h-2" />
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                          Adjust Weights
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end space-x-2">
                    <Button variant="outline">Reset to Defaults</Button>
                    <Button className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
                      Save Settings
                    </Button>
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
