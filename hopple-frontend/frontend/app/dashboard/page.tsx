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
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Project, projectsApi, tasksApi } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("projects");
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
  });

  // Read the tab parameter from the URL when the component mounts
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["projects", "analytics"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Fetch projects when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await projectsApi.getProjects();
        setProjects(projectsData);

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalProjects: projectsData.length,
        }));

        // Fetch tasks for each project to calculate stats
        let activeTasks = 0;
        let completedTasks = 0;

        for (const project of projectsData) {
          try {
            const tasks = await tasksApi.getProjectTasks(project.id);
            activeTasks += tasks.filter(
              (task) => task.status !== "completed"
            ).length;
            completedTasks += tasks.filter(
              (task) => task.status === "completed"
            ).length;
          } catch (err) {
            console.error(
              `Error fetching tasks for project ${project.id}:`,
              err
            );
          }
        }

        setStats((prev) => ({
          ...prev,
          activeTasks,
          completedTasks,
          // This would ideally come from a team members API
          teamMembers: 8,
        }));
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err.response?.data?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">
                Welcome back, {user?.name?.split(" ")[0] || "User"}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Activity
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Projects
                  </CardTitle>
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalProjects}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalProjects > 0
                      ? "Active projects"
                      : "No projects yet"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Tasks
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    Tasks in progress
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Tasks
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.completedTasks}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tasks completed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Team Members
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.teamMembers}</div>
                  <p className="text-xs text-muted-foreground">
                    Active members
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="projects" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Projects</h2>
                <Button asChild>
                  <Link href="/projects/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Link>
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="h-6 w-3/4 bg-muted rounded mb-4"></div>
                      <div className="h-4 w-full bg-muted rounded mb-6"></div>
                      <div className="h-2 w-full bg-muted rounded mb-2"></div>
                      <div className="h-8 w-full bg-muted rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-8 w-1/3 bg-muted rounded"></div>
                        <div className="flex space-x-1">
                          {[1, 2, 3].map((j) => (
                            <div
                              key={j}
                              className="h-8 w-8 bg-muted rounded-full"
                            ></div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {projects.slice(0, 3).map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      title={project.name}
                      description={project.description || ""}
                      progress={75} // This would ideally be calculated from tasks
                      dueDate={
                        project.dueDate
                          ? new Date(project.dueDate).toLocaleDateString()
                          : "No due date"
                      }
                      tasks={{ total: 0, completed: 0 }} // This would ideally be fetched from the API
                      members={[]} // This would ideally be fetched from the API
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first project to get started
                  </p>
                  <Button asChild>
                    <Link href="/projects/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Link>
                  </Button>
                </div>
              )}

              {projects.length > 0 && (
                <div className="flex items-center justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/projects">
                      View All Projects
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Project Analytics</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Last 30 Days
                  </Button>
                  <Button variant="outline" size="sm">
                    <LineChart className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Task Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                      <p className="text-muted-foreground">Chart placeholder</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Project Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                      <p className="text-muted-foreground">Chart placeholder</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
