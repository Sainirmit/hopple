"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  CheckCircle,
  Circle,
  MessageSquare,
  Plus,
  Trash2,
  Pencil,
  Cpu,
  Save,
  Check,
  AlertTriangle,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import Link from "next/link";
import { Task } from "@/types/task";

// Simple toast implementation since we don't have the actual component
const useToast = () => {
  const toast = (props: {
    title: string;
    description?: string;
    variant?: "default" | "destructive";
  }) => {
    console.log(`Toast: ${props.title} - ${props.description}`);
  };

  return { toast };
};

// Define the expected shape of the params
interface RouteParams {
  id: string;
  taskId: string;
}

// Define proper types for component props
interface PageProps {
  params: Promise<RouteParams>;
}

export default function TaskDetailPage({ params }: PageProps) {
  // Setup
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Unwrap params using React.use() - proper way for Next.js 15
  const resolvedParams = React.use(params);
  const { id: projectId, taskId } = resolvedParams;

  // Parse query parameters
  const isNew = searchParams.get("new") === "true";
  const initialStatus = searchParams.get("status") || "To Do";

  // State management
  const [isEditing, setIsEditing] = useState(isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [comment, setComment] = useState("");

  // Mock data - In a real app, you would fetch this data from an API
  useEffect(() => {
    if (isNew) {
      // Create a new task template
      const newTask: Task = {
        id: taskId,
        name: "",
        description: "",
        project: "Website Redesign",
        priority: "Medium",
        status: initialStatus as "Backlog" | "To Do" | "In Progress" | "Done",
        dueDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        assignee: {
          name: "Unassigned",
          image: "/placeholder.svg?height=32&width=32",
        },
        aiCreated: false,
      };
      setTask(newTask);
    } else {
      // Simulate loading task data
      const mockTask: Task = {
        id: taskId,
        name: `Task ${taskId}`,
        description:
          "This is a detailed description of the task that would normally be fetched from an API.",
        project: "Website Redesign",
        priority: "Medium",
        status: "In Progress",
        dueDate: "Mar 15, 2025",
        assignee: {
          name: "Sarah",
          image: "/placeholder.svg?height=32&width=32",
        },
        aiCreated: false,
      };

      // Mock subtasks
      const mockSubtasks: Task[] = [
        {
          id: `${taskId}-sub-1`,
          name: "Subtask 1",
          description: "First subtask description",
          project: "Website Redesign",
          priority: "High",
          status: "Done",
          dueDate: "Mar 10, 2025",
          assignee: {
            name: "Mike",
            image: "/placeholder.svg?height=32&width=32",
          },
          aiCreated: false,
          parentId: taskId,
        },
        {
          id: `${taskId}-sub-2`,
          name: "Subtask 2",
          description: "Second subtask description",
          project: "Website Redesign",
          priority: "Low",
          status: "To Do",
          dueDate: "Mar 14, 2025",
          assignee: {
            name: "Emma",
            image: "/placeholder.svg?height=32&width=32",
          },
          aiCreated: true,
          parentId: taskId,
        },
      ];

      setTask(mockTask);
      setSubtasks(mockSubtasks);
    }
  }, [taskId, isNew, initialStatus]);

  // Helper to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
      case "Medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
      case "Low":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  // Handle save
  const handleSave = useCallback(() => {
    if (!task) return;

    if (!task.name) {
      toast({
        title: "Task name is required",
        description: "Please enter a name for the task.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);

      toast({
        title: "Task saved",
        description: "The task has been saved successfully.",
      });

      // In a real application, you would make an API call here
      console.log("Saving task:", task);

      // If this was a new task, update the URL to remove the 'new' parameter
      if (isNew) {
        router.replace(`/projects/${projectId}/tasks/${taskId}`);
      }
    }, 1000);
  }, [task, isNew, projectId, taskId, router, toast]);

  // Handle adding a subtask
  const handleAddSubtask = () => {
    if (!newSubtaskName.trim()) {
      toast({
        title: "Subtask name is required",
        description: "Please enter a name for the subtask.",
        variant: "destructive",
      });
      return;
    }

    const newSubtask: Task = {
      id: `${taskId}-sub-${Date.now()}`,
      name: newSubtaskName,
      description: "",
      project: task?.project || "Website Redesign",
      priority: "Medium",
      status: "To Do",
      dueDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      assignee: {
        name: "Unassigned",
        image: "/placeholder.svg?height=32&width=32",
      },
      aiCreated: false,
      parentId: taskId,
    };

    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskName("");
    setShowAddSubtask(false);

    toast({
      title: "Subtask added",
      description: "The subtask has been added successfully.",
    });
  };

  // Handle toggling subtask status
  const handleToggleSubtaskStatus = (subtaskId: string) => {
    const updatedSubtasks = subtasks.map((subtask) => {
      if (subtask.id === subtaskId) {
        return {
          ...subtask,
          status: subtask.status === "Done" ? "To Do" : "Done",
        } as Task;
      }
      return subtask;
    });

    setSubtasks(updatedSubtasks);
  };

  // Handle adding a comment
  const handleAddComment = () => {
    if (!comment.trim()) {
      toast({
        title: "Comment text is required",
        description: "Please enter some text for your comment.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would send this to an API
    console.log("Adding comment:", comment);

    toast({
      title: "Comment added",
      description: "Your comment has been added successfully.",
    });

    setComment("");
  };

  // Type-safe assignee selection
  const getAssignee = (name: string) => {
    const assigneeMap: Record<string, { name: string; image: string }> = {
      Sarah: { name: "Sarah", image: "/placeholder.svg?height=32&width=32" },
      Mike: { name: "Mike", image: "/placeholder.svg?height=32&width=32" },
      Emma: { name: "Emma", image: "/placeholder.svg?height=32&width=32" },
      John: { name: "John", image: "/placeholder.svg?height=32&width=32" },
      Alex: { name: "Alex", image: "/placeholder.svg?height=32&width=32" },
      Unassigned: {
        name: "Unassigned",
        image: "/placeholder.svg?height=32&width=32",
      },
    };

    return assigneeMap[name] || assigneeMap["Unassigned"];
  };

  // If task is null, show loading
  if (!task) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-lg text-muted-foreground">
                Loading task...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <main className="flex-1 p-6">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${projectId}?tab=tasks`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Task Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {task.status === "Done" ? (
                  <CheckCircle
                    className="h-5 w-5 text-emerald-500 mr-2 cursor-pointer"
                    onClick={() => setTask({ ...task, status: "To Do" })}
                  />
                ) : (
                  <Circle
                    className="h-5 w-5 text-muted-foreground mr-2 cursor-pointer"
                    onClick={() => setTask({ ...task, status: "Done" })}
                  />
                )}
                {isEditing ? (
                  <Input
                    value={task.name}
                    onChange={(e) => setTask({ ...task, name: e.target.value })}
                    className="text-2xl font-bold h-auto py-1 px-2"
                    placeholder="Task name"
                    autoFocus
                  />
                ) : (
                  <h1 className="text-2xl font-bold">
                    {task.name || "Untitled Task"}
                  </h1>
                )}
              </div>
              <Badge variant="outline" className="ml-2">
                {task.id}
              </Badge>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (isNew) {
                        // If canceling a new task, go back to the project
                        router.push(`/projects/${projectId}`);
                      } else {
                        setIsEditing(false);
                      }
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Task
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Task content */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              {/* Main task details */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="task-description">Description</Label>
                        <Textarea
                          id="task-description"
                          value={task.description || ""}
                          onChange={(e) =>
                            setTask({ ...task, description: e.target.value })
                          }
                          rows={4}
                          placeholder="Enter a detailed description of this task"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted-foreground">
                        {task.description || "No description provided."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subtasks */}
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Subtasks</CardTitle>
                  {!showAddSubtask && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddSubtask(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Subtask
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {showAddSubtask && (
                    <div className="mb-4 p-3 border rounded-lg">
                      <Label
                        htmlFor="new-subtask"
                        className="text-sm font-medium"
                      >
                        New Subtask
                      </Label>
                      <div className="mt-2 flex space-x-2">
                        <Input
                          id="new-subtask"
                          placeholder="Enter subtask name"
                          value={newSubtaskName}
                          onChange={(e) => setNewSubtaskName(e.target.value)}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={handleAddSubtask}>
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowAddSubtask(false);
                            setNewSubtaskName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {subtasks.length > 0 ? (
                      subtasks.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="p-3 border rounded-lg flex items-start gap-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="mt-1">
                            {subtask.status === "Done" ? (
                              <CheckCircle
                                className="h-4 w-4 text-emerald-500 cursor-pointer"
                                onClick={() =>
                                  handleToggleSubtaskStatus(subtask.id)
                                }
                              />
                            ) : (
                              <Circle
                                className="h-4 w-4 text-muted-foreground cursor-pointer"
                                onClick={() =>
                                  handleToggleSubtaskStatus(subtask.id)
                                }
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p
                                  className={`font-medium ${
                                    subtask.status === "Done"
                                      ? "line-through text-muted-foreground"
                                      : ""
                                  }`}
                                >
                                  {subtask.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {subtask.id}
                                </p>
                              </div>
                              <Badge
                                className={getPriorityColor(subtask.priority)}
                                variant="outline"
                              >
                                {subtask.priority}
                              </Badge>
                            </div>
                            {subtask.description && (
                              <p
                                className={`text-sm text-muted-foreground mt-1 ${
                                  subtask.status === "Done"
                                    ? "line-through"
                                    : ""
                                }`}
                              >
                                {subtask.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={subtask.assignee.image}
                                    alt={subtask.assignee.name}
                                  />
                                  <AvatarFallback>
                                    {subtask.assignee.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                {subtask.aiCreated && (
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#6E2CF4]">
                                    <Cpu className="h-2.5 w-2.5 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Due: {subtask.dueDate}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No subtasks yet</p>
                        <p className="text-sm">
                          Add a subtask to break down this task
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Comments */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No comments yet</p>
                    <p className="text-sm">
                      Be the first to comment on this task
                    </p>
                  </div>
                  <Separator className="my-4" />
                  <div className="mt-4">
                    <Textarea
                      placeholder="Add a comment..."
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!comment.trim()}
                      >
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Task sidebar */}
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Task Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Status
                    </Label>
                    {isEditing ? (
                      <Select
                        value={task.status}
                        onValueChange={(value) =>
                          setTask({
                            ...task,
                            status: value as
                              | "Backlog"
                              | "To Do"
                              | "In Progress"
                              | "Done",
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Backlog">Backlog</SelectItem>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        {task.status === "Done" ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{task.status}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Priority
                    </Label>
                    {isEditing ? (
                      <Select
                        value={task.priority}
                        onValueChange={(value) =>
                          setTask({
                            ...task,
                            priority: value as "High" | "Medium" | "Low",
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <Badge
                          className={getPriorityColor(task.priority)}
                          variant="outline"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Due Date
                    </Label>
                    {isEditing ? (
                      <Input
                        className="mt-1"
                        type="date"
                        value={task.dueDate}
                        onChange={(e) =>
                          setTask({ ...task, dueDate: e.target.value })
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{task.dueDate}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Assignee
                    </Label>
                    {isEditing ? (
                      <Select
                        value={task.assignee.name}
                        onValueChange={(value) => {
                          setTask({ ...task, assignee: getAssignee(value) });
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sarah">Sarah</SelectItem>
                          <SelectItem value="Mike">Mike</SelectItem>
                          <SelectItem value="Emma">Emma</SelectItem>
                          <SelectItem value="John">John</SelectItem>
                          <SelectItem value="Alex">Alex</SelectItem>
                          <SelectItem value="Unassigned">Unassigned</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={task.assignee.image}
                            alt={task.assignee.name}
                          />
                          <AvatarFallback>
                            {task.assignee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{task.assignee.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Project
                    </Label>
                    <div className="mt-1">
                      <span>{task.project}</span>
                    </div>
                  </div>

                  {task.aiCreated && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#6E2CF4]">
                        <Cpu className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="text-sm">AI Generated</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              {!isEditing && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowAddSubtask(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Subtask
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        setTask({
                          ...task,
                          status: task.status === "Done" ? "To Do" : "Done",
                        })
                      }
                    >
                      {task.status === "Done" ? (
                        <>
                          <Circle className="mr-2 h-4 w-4" />
                          Mark as Not Done
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Mark as Done
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
