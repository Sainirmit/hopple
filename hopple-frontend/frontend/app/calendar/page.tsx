"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  subWeeks,
  startOfMonth,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  isWithinInterval,
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample events data
const events = [
  {
    id: 1,
    title: "Team Standup",
    description: "Daily team sync meeting",
    date: new Date(2025, 2, 15, 9, 30),
    endDate: new Date(2025, 2, 15, 10, 0),
    type: "meeting", // meeting, deadline, milestone
    projectId: "website-redesign",
    projectTitle: "Website Redesign",
    color: "#6E2CF4",
    attendees: [
      { name: "John Doe", image: "/placeholder.svg?height=32&width=32" },
      { name: "Sarah Wilson", image: "/placeholder.svg?height=32&width=32" },
      { name: "Mike Johnson", image: "/placeholder.svg?height=32&width=32" },
    ],
  },
  {
    id: 2,
    title: "Client Presentation",
    description: "Present website designs to client",
    date: new Date(2025, 2, 17, 14, 0),
    endDate: new Date(2025, 2, 17, 15, 30),
    type: "meeting",
    projectId: "website-redesign",
    projectTitle: "Website Redesign",
    color: "#6E2CF4",
    attendees: [
      { name: "John Doe", image: "/placeholder.svg?height=32&width=32" },
      { name: "Sarah Wilson", image: "/placeholder.svg?height=32&width=32" },
    ],
  },
  {
    id: 3,
    title: "Design Deadline",
    description: "All website designs must be completed",
    date: new Date(2025, 2, 20, 18, 0),
    endDate: new Date(2025, 2, 20, 18, 0),
    type: "deadline",
    projectId: "website-redesign",
    projectTitle: "Website Redesign",
    color: "#FF2B8F",
    attendees: [],
  },
  {
    id: 4,
    title: "App Dev Sprint Planning",
    description: "Plan next sprint for mobile app",
    date: new Date(2025, 2, 16, 11, 0),
    endDate: new Date(2025, 2, 16, 12, 30),
    type: "meeting",
    projectId: "mobile-app-development",
    projectTitle: "Mobile App Development",
    color: "#3B82F6",
    attendees: [
      { name: "John Doe", image: "/placeholder.svg?height=32&width=32" },
      { name: "Jane Smith", image: "/placeholder.svg?height=32&width=32" },
      { name: "Tom Brown", image: "/placeholder.svg?height=32&width=32" },
      { name: "Lisa Green", image: "/placeholder.svg?height=32&width=32" },
    ],
  },
  {
    id: 5,
    title: "Marketing Campaign Launch",
    description: "Official launch of Q2 marketing campaign",
    date: new Date(2025, 2, 22, 9, 0),
    endDate: new Date(2025, 2, 22, 9, 0),
    type: "milestone",
    projectId: "marketing-campaign",
    projectTitle: "Marketing Campaign",
    color: "#10B981",
    attendees: [],
  },
];

// Sample projects for filtering
const projects = [
  { id: "all", name: "All Projects" },
  { id: "website-redesign", name: "Website Redesign" },
  { id: "mobile-app-development", name: "Mobile App Development" },
  { id: "marketing-campaign", name: "Marketing Campaign" },
];

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [selectedProjectId, setSelectedProjectId] = useState("all");

  // Filter events by selected project
  const filteredEvents = events.filter(
    (event) =>
      selectedProjectId === "all" || event.projectId === selectedProjectId
  );

  // Helper function to check if an event is on a specific date
  const isEventOnDate = (event: (typeof events)[0], date: Date) => {
    return isSameDay(event.date, date);
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((event) => isEventOnDate(event, date));
  };

  // Helper for navigation
  const navigateDate = (direction: "prev" | "next") => {
    if (view === "day") {
      setDate(direction === "next" ? addDays(date, 1) : addDays(date, -1));
    } else if (view === "week") {
      setDate(direction === "next" ? addWeeks(date, 1) : subWeeks(date, 1));
    } else if (view === "month") {
      setDate(direction === "next" ? addMonths(date, 1) : subMonths(date, 1));
    }
  };

  // Generate days for week view
  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  // Format date for header based on view
  const getHeaderDate = () => {
    if (view === "day") {
      return format(date, "MMMM dd, yyyy");
    } else if (view === "week") {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      return `${format(weekStart, "MMM d")} - ${format(
        weekEnd,
        "MMM d, yyyy"
      )}`;
    } else {
      return format(date, "MMMM yyyy");
    }
  };

  // Render event badge for month view
  const renderEventBadge = (day: Date) => {
    const dayEvents = getEventsForDate(day);
    if (dayEvents.length === 0) return null;

    return (
      <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-1 overflow-hidden">
        {dayEvents.length <= 2 ? (
          dayEvents.map((event, i) => (
            <div
              key={event.id}
              className="w-full h-1.5 rounded-full"
              style={{ backgroundColor: event.color }}
            />
          ))
        ) : (
          <>
            <div
              className="w-1/3 h-1.5 rounded-full"
              style={{ backgroundColor: dayEvents[0].color }}
            />
            <div className="text-xs font-medium">{`+${dayEvents.length}`}</div>
          </>
        )}
      </div>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Calendar</h1>
              <p className="text-muted-foreground">
                Manage events, deadlines, and milestones
              </p>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateDate("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-bold">{getHeaderDate()}</h2>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateDate("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Tabs
                  value={view}
                  onValueChange={(value) =>
                    setView(value as "day" | "week" | "month")
                  }
                >
                  <TabsList>
                    <TabsTrigger value="month">
                      <CalendarRange className="h-4 w-4 mr-2" />
                      Month
                    </TabsTrigger>
                    <TabsTrigger value="week">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Week
                    </TabsTrigger>
                    <TabsTrigger value="day">
                      <CalendarCheck className="h-4 w-4 mr-2" />
                      Day
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {view === "month" && (
                <div className="rounded-md border">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    className="rounded-md"
                    disabled={false}
                    month={date}
                    classNames={{
                      day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day: "relative h-12 w-12 items-center justify-center p-0 font-normal",
                    }}
                    components={{
                      Day: (props) => {
                        // Extract date from props
                        const date = props.date;
                        return (
                          <div
                            {...props}
                            className="relative h-12 w-full p-2 flex flex-col items-start justify-start border-t"
                          >
                            <span
                              className={`h-6 w-6 flex items-center justify-center rounded-full text-sm ${
                                isToday(date)
                                  ? "bg-accent text-accent-foreground"
                                  : ""
                              }`}
                            >
                              {format(date, "d")}
                            </span>
                            {renderEventBadge(date)}
                          </div>
                        );
                      },
                    }}
                  />
                </div>
              )}

              {view === "week" && (
                <div className="border rounded-md overflow-hidden">
                  <div className="grid grid-cols-7 text-center font-medium bg-muted/20">
                    {getWeekDays(date).map((day, i) => (
                      <div key={i} className="p-2 border-r last:border-r-0">
                        {format(day, "EEE")}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 h-[500px] overflow-y-auto">
                    {getWeekDays(date).map((day, i) => {
                      const dayEvents = getEventsForDate(day);
                      return (
                        <div
                          key={i}
                          className={`border-r last:border-r-0 p-2 min-h-[100px] ${
                            isToday(day) ? "bg-accent/20" : ""
                          }`}
                        >
                          <div className="text-sm font-medium mb-1">
                            {format(day, "d")}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.map((event) => (
                              <div
                                key={event.id}
                                className="text-xs p-1 rounded mb-1 cursor-pointer"
                                style={{
                                  backgroundColor: `${event.color}30`,
                                  borderLeft: `3px solid ${event.color}`,
                                }}
                              >
                                <div className="font-medium">{event.title}</div>
                                <div className="text-[10px]">
                                  {format(event.date, "h:mm a")}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {view === "day" && (
                <div className="border rounded-md overflow-hidden">
                  <div className="p-4 border-b bg-muted/20">
                    <h3 className="font-medium">
                      {format(date, "EEEE, MMMM d")}
                      {isToday(date) && (
                        <Badge
                          variant="outline"
                          className="ml-2 bg-accent text-accent-foreground"
                        >
                          Today
                        </Badge>
                      )}
                    </h3>
                  </div>
                  <div className="px-4 py-6 space-y-4">
                    {getEventsForDate(date).length > 0 ? (
                      getEventsForDate(date).map((event) => (
                        <Card key={event.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle>{event.title}</CardTitle>
                                <CardDescription>
                                  {event.description}
                                </CardDescription>
                              </div>
                              <Badge
                                className="capitalize"
                                style={{ backgroundColor: event.color }}
                              >
                                {event.type}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {format(event.date, "h:mm a")}
                                  {event.type === "meeting" &&
                                    ` - ${format(event.endDate, "h:mm a")}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                                <span>{event.projectTitle}</span>
                              </div>
                              {event.attendees.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>Attendees</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 ml-6">
                                    {event.attendees.map((attendee, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-2"
                                      >
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage
                                            src={attendee.image}
                                            alt={attendee.name}
                                          />
                                          <AvatarFallback>
                                            {attendee.name[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">
                                          {attendee.name}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">
                          No events scheduled
                        </h3>
                        <p className="text-muted-foreground">
                          No events, deadlines, or milestones for this day.
                        </p>
                        <Button className="mt-4 bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Event
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Your next 5 scheduled events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents
                  .filter((event) => new Date(event.date) >= new Date())
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 5)
                  .map((event) => (
                    <div key={event.id} className="flex items-start gap-4">
                      <div
                        className="w-1 h-10 rounded-full self-stretch"
                        style={{ backgroundColor: event.color }}
                      ></div>
                      <div className="min-w-24 text-sm">
                        <div className="font-medium">
                          {format(event.date, "MMM d, yyyy")}
                        </div>
                        <div className="text-muted-foreground">
                          {format(event.date, "h:mm a")}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.description}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        style={{ color: event.color, borderColor: event.color }}
                      >
                        {event.type}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
