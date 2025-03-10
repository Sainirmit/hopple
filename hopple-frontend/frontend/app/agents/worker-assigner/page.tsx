"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Check,
  ChevronLeft,
  Cpu,
  History,
  Settings,
  CheckCircle2,
  AlertCircle,
  CircleHelp,
  Clock,
  ArrowRight,
  Users,
  UserCheck,
  BarChart,
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

export default function WorkerAssignerPage() {
  const [activeTab, setActiveTab] = useState("assign");
  const [selectedProject, setSelectedProject] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Sample projects for selection
  const projects = [
    { id: "website-redesign", name: "Website Redesign" },
    { id: "mobile-app-development", name: "Mobile App Development" },
    { id: "marketing-campaign", name: "Marketing Campaign" },
    { id: "crm-implementation", name: "CRM Implementation" },
    { id: "product-roadmap", name: "Product Roadmap" },
  ];

  // Sample team members
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Wilson",
      role: "UI/UX Designer",
      image: "/placeholder.svg?height=32&width=32",
      skills: ["UI Design", "Wireframing", "User Research"],
      workload: 65,
      availability: "high",
    },
    {
      id: 2,
      name: "Mike Johnson",
      role: "Frontend Developer",
      image: "/placeholder.svg?height=32&width=32",
      skills: ["React", "TypeScript", "CSS"],
      workload: 85,
      availability: "low",
    },
    {
      id: 3,
      name: "Emma Davis",
      role: "Content Strategist",
      image: "/placeholder.svg?height=32&width=32",
      skills: ["Content Writing", "SEO", "Marketing"],
      workload: 70,
      availability: "medium",
    },
    {
      id: 4,
      name: "Alex Brown",
      role: "QA Engineer",
      image: "/placeholder.svg?height=32&width=32",
      skills: ["Testing", "Bug Tracking", "Automation"],
      workload: 60,
      availability: "high",
    },
  ];

  // Sample task assignments
  const taskAssignments = [
    {
      taskId: 1,
      taskTitle: "Create wireframes for homepage",
      previousAssignee: null,
      newAssignee: {
        id: 1,
        name: "Sarah Wilson",
        image: "/placeholder.svg?height=32&width=32",
      },
      skillsMatch: 95,
      reasoning:
        "Sarah has expertise in wireframing and UI design, with high availability.",
    },
    {
      taskId: 2,
      taskTitle: "Implement responsive navigation",
      previousAssignee: {
        id: 3,
        name: "Emma Davis",
        image: "/placeholder.svg?height=32&width=32",
      },
      newAssignee: {
        id: 2,
        name: "Mike Johnson",
        image: "/placeholder.svg?height=32&width=32",
      },
      skillsMatch: 90,
      reasoning:
        "Mike has strong frontend development skills needed for navigation components. Reassigned from Emma who lacks the technical skills.",
    },
    {
      taskId: 3,
      taskTitle: "Write product descriptions",
      previousAssignee: null,
      newAssignee: {
        id: 3,
        name: "Emma Davis",
        image: "/placeholder.svg?height=32&width=32",
      },
      skillsMatch: 98,
      reasoning:
        "Emma's content writing background is perfect for creating compelling product descriptions.",
    },
    {
      taskId: 4,
      taskTitle: "Test user authentication flow",
      previousAssignee: {
        id: 2,
        name: "Mike Johnson",
        image: "/placeholder.svg?height=32&width=32",
      },
      newAssignee: {
        id: 4,
        name: "Alex Brown",
        image: "/placeholder.svg?height=32&width=32",
      },
      skillsMatch: 85,
      reasoning:
        "Alex's QA expertise is better suited for testing. Mike is needed for frontend development tasks.",
    },
  ];

  // Sample history data
  const historyData = [
    {
      id: 1,
      date: "Mar 09, 2025",
      project: "Website Redesign",
      tasksAssigned: 12,
      status: "completed",
    },
    {
      id: 2,
      date: "Mar 07, 2025",
      project: "Mobile App Development",
      tasksAssigned: 15,
      status: "completed",
    },
    {
      id: 3,
      date: "Mar 04, 2025",
      project: "Marketing Campaign",
      tasksAssigned: 8,
      status: "completed",
    },
    {
      id: 4,
      date: "Mar 01, 2025",
      project: "Website Redesign",
      tasksAssigned: 10,
      status: "completed",
    },
  ];

  // Function to handle assignment
  const handleAssign = () => {
    if (!selectedProject) return;

    setAssigning(true);

    // Simulate AI assignment with a timeout
    setTimeout(() => {
      setAssigning(false);
    }, 3000);
  };

  // Helper for skill match color
  const getSkillMatchColor = (match: number) => {
    if (match >= 90) return "text-emerald-500";
    if (match >= 75) return "text-amber-500";
    return "text-red-500";
  };

  // Helper to get availability badge
  const getAvailabilityBadge = (availability: string) => {
    const colors: Record<string, string> = {
      high: "bg-emerald-500 text-white",
      medium: "bg-amber-500 text-white",
      low: "bg-red-500 text-white",
    };

    return (
      <Badge className={colors[availability] || "bg-gray-500"}>
        {availability}
      </Badge>
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
                <h1 className="text-3xl font-bold">Worker Assigner</h1>
                <p className="text-muted-foreground">
                  AI agent that matches the best team members to tasks
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
              <TabsTrigger value="assign">
                <UserCheck className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                <span className="hidden md:inline-block lg:inline-block">
                  Assign Workers
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

            <TabsContent value="assign" className="mt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Assign Team Members</CardTitle>
                    <CardDescription>
                      Let AI match the best team members to your project tasks
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
                      <Label>Assignment Factors</Label>
                      <div className="rounded-md border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="skills-match" className="text-sm">
                              Skills Match
                            </Label>
                            <CircleHelp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Switch id="skills-match" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="workload" className="text-sm">
                              Current Workload
                            </Label>
                            <CircleHelp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Switch id="workload" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="availability" className="text-sm">
                              Availability
                            </Label>
                            <CircleHelp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Switch id="availability" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Label
                              htmlFor="past-performance"
                              className="text-sm"
                            >
                              Past Performance
                            </Label>
                            <CircleHelp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Switch id="past-performance" defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border p-4 bg-muted/20 space-y-1">
                      <p className="text-sm font-medium">
                        Available Team Members
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {teamMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-1"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={member.image}
                                alt={member.name}
                              />
                              <AvatarFallback>
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90"
                      onClick={handleAssign}
                      disabled={assigning || !selectedProject}
                    >
                      {assigning ? (
                        <>
                          <Cpu className="mr-2 h-4 w-4 animate-pulse" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Assign Team Members
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle>Assignment Results</CardTitle>
                    <CardDescription>
                      {selectedProject
                        ? `Team assignments for ${
                            projects.find((p) => p.id === selectedProject)?.name
                          }`
                        : "Select a project to see suggested team assignments"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedProject ? (
                      <div className="space-y-4">
                        {taskAssignments.map((assignment) => (
                          <div
                            key={assignment.taskId}
                            className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex flex-col gap-3">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold">
                                  {assignment.taskTitle}
                                </h3>
                                <div
                                  className={`text-sm font-medium ${getSkillMatchColor(
                                    assignment.skillsMatch
                                  )}`}
                                >
                                  {assignment.skillsMatch}% match
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  {assignment.previousAssignee ? (
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage
                                            src={
                                              assignment.previousAssignee.image
                                            }
                                            alt={
                                              assignment.previousAssignee.name
                                            }
                                          />
                                          <AvatarFallback>
                                            {assignment.previousAssignee.name.charAt(
                                              0
                                            )}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-muted-foreground">
                                          {assignment.previousAssignee.name}
                                        </span>
                                      </div>
                                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  ) : (
                                    <Badge variant="secondary">
                                      New Assignment
                                    </Badge>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage
                                        src={assignment.newAssignee.image}
                                        alt={assignment.newAssignee.name}
                                      />
                                      <AvatarFallback>
                                        {assignment.newAssignee.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">
                                      {assignment.newAssignee.name}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-muted/30 p-3 rounded text-sm">
                                <span className="font-medium">
                                  AI reasoning:{" "}
                                </span>
                                <span className="text-muted-foreground">
                                  {assignment.reasoning}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">
                          No project selected
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Select a project and click "Assign Team Members" to
                          match tasks with team members
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
                  <CardTitle>Assignment History</CardTitle>
                  <CardDescription>
                    Previous team assignments made by the AI
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
                              {item.tasksAssigned}
                            </span>{" "}
                            tasks assigned
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
                  <CardTitle>Worker Assigner Settings</CardTitle>
                  <CardDescription>
                    Configure how the worker assignment agent works
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
                          <Label>Auto-assignments</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically assign workers to new tasks
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Send notifications for new assignments
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Assignment Preferences</h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Matching Algorithm</Label>
                        <Select defaultValue="balanced">
                          <SelectTrigger>
                            <SelectValue placeholder="Select matching approach" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skills">Skills First</SelectItem>
                            <SelectItem value="balanced">
                              Balanced Approach
                            </SelectItem>
                            <SelectItem value="workload">
                              Workload Distribution
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Factor Weights</Label>
                        <div className="space-y-3 pt-2">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Skills Match</span>
                              <span>45%</span>
                            </div>
                            <Progress value={45} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Current Workload</span>
                              <span>25%</span>
                            </div>
                            <Progress value={25} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Team Member Availability</span>
                              <span>20%</span>
                            </div>
                            <Progress value={20} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Past Performance</span>
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
