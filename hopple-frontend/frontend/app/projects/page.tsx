"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Filter, FolderKanban, Plus, Search } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProjectCard } from "@/components/project-card";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

// Sample project data
const projectsData = [
  {
    id: "website-redesign",
    title: "Website Redesign",
    description: "Modernize company website with new branding",
    progress: 75,
    dueDate: "Mar 15, 2025",
    tasks: { completed: 18, total: 24 },
    members: [
      { name: "Alex", image: "/placeholder.svg?height=40&width=40" },
      { name: "Sarah", image: "/placeholder.svg?height=40&width=40" },
      { name: "Mike", image: "/placeholder.svg?height=40&width=40" },
    ],
    agentStatus: "active" as "active" | "inactive",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "mobile-app-development",
    title: "Mobile App Development",
    description: "Create iOS and Android apps for customers",
    progress: 45,
    dueDate: "Apr 30, 2025",
    tasks: { completed: 12, total: 32 },
    members: [
      { name: "Jane", image: "/placeholder.svg?height=40&width=40" },
      { name: "Tom", image: "/placeholder.svg?height=40&width=40" },
      { name: "Lisa", image: "/placeholder.svg?height=40&width=40" },
      { name: "David", image: "/placeholder.svg?height=40&width=40" },
    ],
    agentStatus: "active" as "active" | "inactive",
    status: "In Progress",
    priority: "Medium",
  },
  {
    id: "marketing-campaign",
    title: "Marketing Campaign",
    description: "Q2 product launch marketing strategy",
    progress: 20,
    dueDate: "May 10, 2025",
    tasks: { completed: 5, total: 18 },
    members: [
      { name: "Emma", image: "/placeholder.svg?height=40&width=40" },
      { name: "John", image: "/placeholder.svg?height=40&width=40" },
    ],
    agentStatus: "active" as "active" | "inactive",
    status: "Planning",
    priority: "Medium",
  },
  {
    id: "crm-implementation",
    title: "CRM Implementation",
    description: "Deploy new customer relationship management system",
    progress: 62,
    dueDate: "Jun 15, 2025",
    tasks: { completed: 20, total: 34 },
    members: [
      { name: "Robert", image: "/placeholder.svg?height=40&width=40" },
      { name: "Amy", image: "/placeholder.svg?height=40&width=40" },
      { name: "Kevin", image: "/placeholder.svg?height=40&width=40" },
    ],
    agentStatus: "active" as "active" | "inactive",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "product-roadmap",
    title: "Product Roadmap",
    description: "Define 12-month product strategy and features",
    progress: 85,
    dueDate: "Mar 01, 2025",
    tasks: { completed: 12, total: 14 },
    members: [
      { name: "Jessica", image: "/placeholder.svg?height=40&width=40" },
      { name: "Marcus", image: "/placeholder.svg?height=40&width=40" },
    ],
    agentStatus: "active" as "active" | "inactive",
    status: "Review",
    priority: "High",
  },
  {
    id: "office-remodel",
    title: "Office Remodel",
    description: "Update workspace to improve collaboration",
    progress: 30,
    dueDate: "Aug 20, 2025",
    tasks: { completed: 3, total: 26 },
    members: [
      { name: "Paul", image: "/placeholder.svg?height=40&width=40" },
      { name: "Samantha", image: "/placeholder.svg?height=40&width=40" },
      { name: "Derek", image: "/placeholder.svg?height=40&width=40" },
    ],
    agentStatus: "inactive" as "active" | "inactive",
    status: "In Progress",
    priority: "Low",
  },
];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Filter projects based on search query and filters
  const filteredProjects = projectsData.filter((project) => {
    // Search filter
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      project.status.toLowerCase() === statusFilter.toLowerCase();

    // Priority filter
    const matchesPriority =
      priorityFilter === "all" ||
      project.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-muted-foreground">
                Manage and track all your projects
              </p>
            </div>
            <Button
              className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90"
              asChild
            >
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Filters:</p>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {filteredProjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  progress={project.progress}
                  dueDate={project.dueDate}
                  tasks={project.tasks}
                  members={project.members}
                  agentStatus={project.agentStatus}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
