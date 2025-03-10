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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronLeft,
  Cpu,
  FileText,
  History,
  PlusCircle,
  Settings,
  Sliders,
  TrashIcon,
  CheckCircle2,
  AlertCircle,
  CircleHelp,
  Clock,
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

export default function TaskCreatorPage() {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedProject, setSelectedProject] = useState("");
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");

  // Sample projects for selection
  const projects = [
    { id: "website-redesign", name: "Website Redesign" },
    { id: "mobile-app-development", name: "Mobile App Development" },
    { id: "marketing-campaign", name: "Marketing Campaign" },
    { id: "crm-implementation", name: "CRM Implementation" },
    { id: "product-roadmap", name: "Product Roadmap" },
  ];

  // Sample history data
  const taskHistory = [
    {
      id: 1,
      date: "Mar 08, 2025",
      project: "Website Redesign",
      input:
        "We need to redesign the homepage with a focus on conversion optimization and mobile responsiveness.",
      tasksGenerated: 8,
      status: "completed",
    },
    {
      id: 2,
      date: "Mar 06, 2025",
      project: "Mobile App Development",
      input:
        "Implement user authentication and profile management in the iOS app.",
      tasksGenerated: 12,
      status: "completed",
    },
    {
      id: 3,
      date: "Mar 05, 2025",
      project: "Marketing Campaign",
      input:
        "Create social media content schedule for product launch in April.",
      tasksGenerated: 15,
      status: "completed",
    },
    {
      id: 4,
      date: "Mar 02, 2025",
      project: "Website Redesign",
      input: "Optimize product pages for better e-commerce conversion.",
      tasksGenerated: 9,
      status: "completed",
    },
  ];

  // Sample generated tasks (used after "generating" completes)
  const sampleGeneratedTasks = [
    {
      id: 1,
      title: "Create wireframes for new homepage layout",
      description:
        "Design a responsive wireframe that highlights key conversion points and maintains brand identity.",
      estimatedTime: "4 hours",
      priority: "high",
      skills: ["UI/UX Design", "Wireframing"],
    },
    {
      id: 2,
      title: "Implement mobile responsive navigation menu",
      description:
        "Develop a hamburger menu for mobile devices that expands to full navigation on desktop.",
      estimatedTime: "6 hours",
      priority: "high",
      skills: ["Frontend Development", "CSS", "JavaScript"],
    },
    {
      id: 3,
      title: "Optimize hero image for faster loading",
      description:
        "Compress and implement lazy loading for the hero image to improve mobile page speed.",
      estimatedTime: "2 hours",
      priority: "medium",
      skills: ["Image Optimization", "Frontend Development"],
    },
    {
      id: 4,
      title: "Create A/B test for call-to-action buttons",
      description:
        "Set up A/B testing to compare performance of different CTA button colors and text.",
      estimatedTime: "3 hours",
      priority: "medium",
      skills: ["A/B Testing", "Analytics"],
    },
    {
      id: 5,
      title: "Implement lead capture form",
      description:
        "Create and style a lead capture form with validation and backend integration.",
      estimatedTime: "5 hours",
      priority: "high",
      skills: ["Frontend Development", "Backend Integration", "Form Design"],
    },
    {
      id: 6,
      title: "Improve SEO metadata for homepage",
      description:
        "Update title tags, meta descriptions, and structured data for better search visibility.",
      estimatedTime: "2 hours",
      priority: "medium",
      skills: ["SEO", "Content Writing"],
    },
    {
      id: 7,
      title: "Add social sharing functionality",
      description:
        "Implement social sharing buttons that work across desktop and mobile interfaces.",
      estimatedTime: "3 hours",
      priority: "low",
      skills: ["Frontend Development", "Social Media Integration"],
    },
    {
      id: 8,
      title: "Conduct user testing of new homepage design",
      description:
        "Organize user testing session to gather feedback on the new homepage design and navigation.",
      estimatedTime: "6 hours",
      priority: "medium",
      skills: ["User Testing", "Research"],
    },
  ];

  // Function to handle task generation
  const handleGenerateTasks = () => {
    if (!selectedProject || !inputText.trim()) return;

    setGeneratingTasks(true);
    setGeneratedTasks([]);

    // Simulate AI generation with a timeout
    setTimeout(() => {
      setGeneratingTasks(false);
      setGeneratedTasks(sampleGeneratedTasks);
    }, 3000);
  };

  // Function to handle task saving
  const handleSaveTasks = () => {
    // In a real app, this would save the tasks to the backend
    alert(
      `${generatedTasks.length} tasks saved to ${
        projects.find((p) => p.id === selectedProject)?.name
      }`
    );
    setGeneratedTasks([]);
    setInputText("");
    setSelectedProject("");
  };

  // Helper to get priority badge color
  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "text-red-500 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800",
      medium:
        "text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800",
      low: "text-green-500 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800",
    };
    return colors[priority as keyof typeof colors] || "";
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
                <h1 className="text-3xl font-bold">Task Creator</h1>
                <p className="text-muted-foreground">
                  AI agent that generates tasks from project requirements
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
              <TabsTrigger value="create">
                <PlusCircle className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                <span className="hidden md:inline-block lg:inline-block">
                  Create Tasks
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

            <TabsContent value="create" className="mt-6">
              <div className="grid gap-6 md:grid-cols-5">
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>Generate Tasks</CardTitle>
                    <CardDescription>
                      Describe your project requirements and get AI-generated
                      tasks
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
                      <Label htmlFor="requirements">Project Requirements</Label>
                      <Textarea
                        id="requirements"
                        placeholder="Describe what needs to be done. The more details you provide, the better the tasks generated."
                        className="min-h-32"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Task Generation Options</Label>
                      <div className="rounded-md border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Label
                              htmlFor="auto-prioritize"
                              className="text-sm"
                            >
                              Auto-prioritize tasks
                            </Label>
                            <CircleHelp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Switch id="auto-prioritize" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="time-estimates" className="text-sm">
                              Add time estimates
                            </Label>
                            <CircleHelp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Switch id="time-estimates" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="skill-tagging" className="text-sm">
                              Suggest required skills
                            </Label>
                            <CircleHelp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Switch id="skill-tagging" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="ml-auto bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90"
                      onClick={handleGenerateTasks}
                      disabled={
                        generatingTasks || !selectedProject || !inputText.trim()
                      }
                    >
                      {generatingTasks ? (
                        <>
                          <Cpu className="mr-2 h-4 w-4 animate-pulse" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Cpu className="mr-2 h-4 w-4" />
                          Generate Tasks
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                    <CardDescription>
                      Task Creator uses AI to break down project requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-md border p-4 bg-muted/20">
                      <div className="flex items-start space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            1. Analyze Requirements
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            AI breaks down project requirements to understand
                            goals and scope.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border p-4 bg-muted/20">
                      <div className="flex items-start space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">2. Task Generation</h4>
                          <p className="text-sm text-muted-foreground">
                            Creates granular, actionable tasks with detailed
                            information.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border p-4 bg-muted/20">
                      <div className="flex items-start space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                          <Sliders className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">3. Prioritization</h4>
                          <p className="text-sm text-muted-foreground">
                            Tasks are automatically prioritized and estimated
                            for timeframes.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <p className="text-sm text-muted-foreground">
                        Generated tasks can be reviewed and edited before adding
                        to the project.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Generated Tasks Results */}
              {generatedTasks.length > 0 && (
                <Card className="mt-6">
                  <CardHeader className="flex flex-row items-center">
                    <div className="flex-1">
                      <CardTitle>Generated Tasks</CardTitle>
                      <CardDescription>
                        AI has generated {generatedTasks.length} tasks based on
                        your requirements
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGeneratedTasks([])}
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Discard
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90"
                        onClick={handleSaveTasks}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Save All Tasks
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generatedTasks.map((task, index) => (
                        <div
                          key={task.id}
                          className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold">{task.title}</h3>
                              <Badge
                                variant="outline"
                                className={`capitalize ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{task.estimatedTime}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {task.skills.map((skill, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Generation History</CardTitle>
                  <CardDescription>
                    Previous task generations and their results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {taskHistory.map((item) => (
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
                        <p className="text-sm text-muted-foreground mb-4">
                          "
                          {item.input.length > 120
                            ? item.input.substring(0, 120) + "..."
                            : item.input}
                          "
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            <span className="font-medium">
                              {item.tasksGenerated}
                            </span>{" "}
                            tasks generated
                          </span>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            View Tasks
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
                  <CardTitle>Agent Settings</CardTitle>
                  <CardDescription>
                    Configure how the task creator agent works
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">General Settings</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Agent Status</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable or disable the agent
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-add to Project</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically add generated tasks to project
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when tasks are generated
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">AI Model Settings</h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Generation Quality</Label>
                        <Select defaultValue="balanced">
                          <SelectTrigger>
                            <SelectValue placeholder="Select quality level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fast">
                              Fast (Lower quality)
                            </SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="quality">
                              High Quality (Slower)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Task Detail Level</Label>
                        <Select defaultValue="detailed">
                          <SelectTrigger>
                            <SelectValue placeholder="Select detail level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">
                              Basic (Titles only)
                            </SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Task Granularity</Label>
                        <div className="flex items-center gap-4 pt-2">
                          <span className="text-sm text-muted-foreground">
                            Broad
                          </span>
                          <div className="flex-1">
                            <Input
                              type="range"
                              min="1"
                              max="5"
                              defaultValue="3"
                              className="w-full"
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Granular
                          </span>
                        </div>
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
