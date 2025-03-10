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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  Mail,
  Filter,
  MessageSquare,
  Phone,
  Plus,
  Search,
  UserPlus,
  Users,
  Briefcase,
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

// Sample team members data
const teamMembers = [
  {
    id: 1,
    name: "John Doe",
    role: "Project Manager",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    image: "/placeholder.svg?height=128&width=128",
    status: "online", // online, busy, away, offline
    department: "Management",
    workload: 85,
    skills: [
      "Leadership",
      "Project Planning",
      "Risk Management",
      "Stakeholder Communication",
    ],
    recentProjects: ["Website Redesign", "Mobile App Development"],
    joinDate: "Jan 2022",
    completedTasks: 142,
    totalTasks: 168,
    efficiency: 92,
  },
  {
    id: 2,
    name: "Sarah Wilson",
    role: "UI/UX Designer",
    email: "sarah.wilson@example.com",
    phone: "+1 (555) 234-5678",
    image: "/placeholder.svg?height=128&width=128",
    status: "online",
    department: "Design",
    workload: 65,
    skills: ["UI Design", "Wireframing", "User Research", "Prototyping"],
    recentProjects: ["Website Redesign", "Marketing Campaign"],
    joinDate: "Mar 2022",
    completedTasks: 83,
    totalTasks: 95,
    efficiency: 87,
  },
  {
    id: 3,
    name: "Mike Johnson",
    role: "Frontend Developer",
    email: "mike.johnson@example.com",
    phone: "+1 (555) 345-6789",
    image: "/placeholder.svg?height=128&width=128",
    status: "busy",
    department: "Development",
    workload: 95,
    skills: ["React", "TypeScript", "Next.js", "TailwindCSS"],
    recentProjects: ["Website Redesign", "Mobile App Development"],
    joinDate: "Feb 2022",
    completedTasks: 127,
    totalTasks: 140,
    efficiency: 91,
  },
  {
    id: 4,
    name: "Emma Davis",
    role: "Content Strategist",
    email: "emma.davis@example.com",
    phone: "+1 (555) 456-7890",
    image: "/placeholder.svg?height=128&width=128",
    status: "away",
    department: "Marketing",
    workload: 75,
    skills: ["Content Writing", "SEO", "Content Planning", "Editing"],
    recentProjects: ["Website Redesign", "Marketing Campaign"],
    joinDate: "May 2022",
    completedTasks: 65,
    totalTasks: 78,
    efficiency: 83,
  },
  {
    id: 5,
    name: "Alex Brown",
    role: "QA Engineer",
    email: "alex.brown@example.com",
    phone: "+1 (555) 567-8901",
    image: "/placeholder.svg?height=128&width=128",
    status: "offline",
    department: "QA",
    workload: 60,
    skills: [
      "Manual Testing",
      "Automated Testing",
      "Bug Tracking",
      "Test Planning",
    ],
    recentProjects: ["Website Redesign", "Mobile App Development"],
    joinDate: "Jun 2022",
    completedTasks: 52,
    totalTasks: 64,
    efficiency: 81,
  },
  {
    id: 6,
    name: "Jane Smith",
    role: "Backend Developer",
    email: "jane.smith@example.com",
    phone: "+1 (555) 678-9012",
    image: "/placeholder.svg?height=128&width=128",
    status: "online",
    department: "Development",
    workload: 80,
    skills: ["Node.js", "Python", "SQL", "Docker"],
    recentProjects: ["Mobile App Development", "CRM Implementation"],
    joinDate: "Apr 2022",
    completedTasks: 93,
    totalTasks: 115,
    efficiency: 81,
  },
  {
    id: 7,
    name: "Tom Wilson",
    role: "Product Manager",
    email: "tom.wilson@example.com",
    phone: "+1 (555) 789-0123",
    image: "/placeholder.svg?height=128&width=128",
    status: "busy",
    department: "Management",
    workload: 90,
    skills: [
      "Product Strategy",
      "User Stories",
      "Roadmapping",
      "Data Analysis",
    ],
    recentProjects: ["Mobile App Development", "Office Remodel"],
    joinDate: "Feb 2023",
    completedTasks: 75,
    totalTasks: 89,
    efficiency: 84,
  },
  {
    id: 8,
    name: "Lisa Green",
    role: "UX Researcher",
    email: "lisa.green@example.com",
    phone: "+1 (555) 890-1234",
    image: "/placeholder.svg?height=128&width=128",
    status: "online",
    department: "Design",
    workload: 70,
    skills: [
      "User Interviews",
      "Usability Testing",
      "Data Analysis",
      "Personas",
    ],
    recentProjects: ["Mobile App Development", "Product Roadmap"],
    joinDate: "Jul 2022",
    completedTasks: 48,
    totalTasks: 56,
    efficiency: 86,
  },
];

// Department data for analytics
const departmentStats = [
  {
    department: "Development",
    headcount: 12,
    activeProjects: 4,
    avgWorkload: 85,
    efficiency: 87,
  },
  {
    department: "Design",
    headcount: 8,
    activeProjects: 3,
    avgWorkload: 72,
    efficiency: 84,
  },
  {
    department: "Marketing",
    headcount: 6,
    activeProjects: 2,
    avgWorkload: 68,
    efficiency: 79,
  },
  {
    department: "QA",
    headcount: 4,
    activeProjects: 3,
    avgWorkload: 65,
    efficiency: 82,
  },
  {
    department: "Management",
    headcount: 5,
    activeProjects: 5,
    avgWorkload: 88,
    efficiency: 90,
  },
];

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("directory");

  // Filter members based on search and filters
  const filteredMembers = teamMembers.filter((member) => {
    // Search filter
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Department filter
    const matchesDepartment =
      departmentFilter === "all" ||
      member.department.toLowerCase() === departmentFilter.toLowerCase();

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      member.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Status color mapping
  const getStatusColor = (status: string) => {
    const colors = {
      online: "bg-emerald-500",
      busy: "bg-amber-500",
      away: "bg-blue-500",
      offline: "bg-gray-400",
    };
    return colors[status as keyof typeof colors] || "bg-gray-400";
  };

  // Workload color mapping
  const getWorkloadColor = (workload: number) => {
    if (workload > 90) return "text-red-500";
    if (workload > 75) return "text-amber-500";
    if (workload > 60) return "text-emerald-500";
    return "text-blue-500";
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Team</h1>
              <p className="text-muted-foreground">
                Manage your team members and track performance
              </p>
            </div>
            <Button className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </div>

          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 md:w-auto">
              <TabsTrigger value="directory">
                <Users className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                <span className="hidden md:inline-block lg:inline-block">
                  Directory
                </span>
              </TabsTrigger>
              <TabsTrigger value="workload">
                <Briefcase className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                <span className="hidden md:inline-block lg:inline-block">
                  Workload
                </span>
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <Users className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                <span className="hidden md:inline-block lg:inline-block">
                  Analytics
                </span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {activeTab === "directory" && (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div className="relative md:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search by name, role, email..."
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
                      <Select
                        value={departmentFilter}
                        onValueChange={setDepartmentFilter}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          <SelectItem value="development">
                            Development
                          </SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="qa">QA</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="away">Away</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <TabsContent value="directory" className="mt-2">
              {filteredMembers.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredMembers.map((member) => (
                    <Card key={member.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage
                                  src={member.image}
                                  alt={member.name}
                                />
                                <AvatarFallback>
                                  {member.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(
                                  member.status
                                )}`}
                              ></div>
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {member.name}
                              </CardTitle>
                              <CardDescription>{member.role}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {member.department}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Email:
                              </span>
                            </div>
                            <span className="font-medium">{member.email}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Phone:
                              </span>
                            </div>
                            <span className="font-medium">{member.phone}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Workload:
                            </span>
                            <span
                              className={`font-medium ${getWorkloadColor(
                                member.workload
                              )}`}
                            >
                              {member.workload}%
                            </span>
                          </div>
                          <Progress value={member.workload} className="h-2" />
                        </div>

                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">
                            Skills:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {member.skills.slice(0, 3).map((skill, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {member.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{member.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <div className="px-6 py-4 bg-muted/20 border-t flex justify-between">
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                        <Button variant="ghost" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No team members found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or filters
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setDepartmentFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="workload" className="mt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Team Workload</CardTitle>
                  <CardDescription>
                    Current workload distribution across team members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {teamMembers
                      .sort((a, b) => b.workload - a.workload)
                      .map((member) => (
                        <div key={member.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={member.image}
                                  alt={member.name}
                                />
                                <AvatarFallback>
                                  {member.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">
                                  {member.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {member.role}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className={`px-2 py-0 text-xs ${getWorkloadColor(
                                  member.workload
                                )}`}
                              >
                                {member.workload}%
                              </Badge>
                              <div className="text-xs">
                                <span className="font-medium">
                                  {member.recentProjects.length}
                                </span>
                                <span className="text-muted-foreground">
                                  {" "}
                                  projects
                                </span>
                              </div>
                            </div>
                          </div>
                          <Progress
                            value={member.workload}
                            className="h-2"
                            style={{
                              backgroundColor:
                                member.workload > 90
                                  ? "#FEE2E2"
                                  : member.workload > 75
                                  ? "#FEF3C7"
                                  : "#D1FAE5",
                            }}
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 mt-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Assignments</CardTitle>
                    <CardDescription>Team members per project</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Website Redesign", count: 5, progress: 75 },
                        {
                          name: "Mobile App Development",
                          count: 6,
                          progress: 45,
                        },
                        { name: "Marketing Campaign", count: 3, progress: 20 },
                        { name: "CRM Implementation", count: 4, progress: 62 },
                        { name: "Product Roadmap", count: 2, progress: 85 },
                      ].map((project, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{project.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {project.count} members
                            </span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Capacity Planning</CardTitle>
                    <CardDescription>
                      Team availability for new projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { department: "Development", capacity: 15 },
                        { department: "Design", capacity: 35 },
                        { department: "Marketing", capacity: 45 },
                        { department: "QA", capacity: 20 },
                        { department: "Management", capacity: 10 },
                      ].map((dept, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {dept.department}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {dept.capacity}% available
                            </span>
                          </div>
                          <Progress value={dept.capacity} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-2">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Team Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {teamMembers.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across {departmentStats.length} departments
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg. Workload
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(
                        teamMembers.reduce(
                          (acc, member) => acc + member.workload,
                          0
                        ) / teamMembers.length
                      )}
                      %
                    </div>
                    <Progress
                      value={
                        teamMembers.reduce(
                          (acc, member) => acc + member.workload,
                          0
                        ) / teamMembers.length
                      }
                      className="h-2 mt-1"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(
                        (teamMembers.reduce(
                          (acc, member) => acc + member.completedTasks,
                          0
                        ) /
                          teamMembers.reduce(
                            (acc, member) => acc + member.totalTasks,
                            0
                          )) *
                          100
                      )}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {teamMembers.reduce(
                        (acc, member) => acc + member.completedTasks,
                        0
                      )}{" "}
                      of{" "}
                      {teamMembers.reduce(
                        (acc, member) => acc + member.totalTasks,
                        0
                      )}{" "}
                      tasks
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Team Efficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(
                        teamMembers.reduce(
                          (acc, member) => acc + member.efficiency,
                          0
                        ) / teamMembers.length
                      )}
                      %
                    </div>
                    <Progress
                      value={
                        teamMembers.reduce(
                          (acc, member) => acc + member.efficiency,
                          0
                        ) / teamMembers.length
                      }
                      className="h-2 mt-1"
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Metrics by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted/50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            Department
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Headcount
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Active Projects
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Avg. Workload
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Efficiency
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentStats.map((dept, i) => (
                          <tr key={i} className="border-b">
                            <td className="px-6 py-4 font-medium">
                              {dept.department}
                            </td>
                            <td className="px-6 py-4">{dept.headcount}</td>
                            <td className="px-6 py-4">{dept.activeProjects}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span>{dept.avgWorkload}%</span>
                                <Progress
                                  value={dept.avgWorkload}
                                  className="h-2 w-20"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span>{dept.efficiency}%</span>
                                <Progress
                                  value={dept.efficiency}
                                  className="h-2 w-20"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 mt-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                    <CardDescription>
                      Highest efficiency team members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamMembers
                        .sort((a, b) => b.efficiency - a.efficiency)
                        .slice(0, 5)
                        .map((member, i) => (
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
                                <AvatarFallback>
                                  {member.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">
                                  {member.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {member.role}
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-emerald-500">
                              {member.efficiency}%
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skill Distribution</CardTitle>
                    <CardDescription>Skills across the team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { skill: "React", count: 5, percentage: 63 },
                        { skill: "UI Design", count: 3, percentage: 38 },
                        { skill: "Project Planning", count: 4, percentage: 50 },
                        { skill: "Testing", count: 3, percentage: 38 },
                        { skill: "Content Writing", count: 2, percentage: 25 },
                      ].map((skill, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{skill.skill}</span>
                            <span className="text-sm text-muted-foreground">
                              {skill.count} members ({skill.percentage}%)
                            </span>
                          </div>
                          <Progress value={skill.percentage} className="h-2" />
                        </div>
                      ))}
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
