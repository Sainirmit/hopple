"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Cpu,
  Pencil,
  MessageSquare,
  MoreHorizontal,
  CheckCircle,
  Circle,
  X,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
} from "lucide-react";
import { Task } from "@/types/task";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  task: Task;
  isNewTask: boolean;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddSubtask: (parentTask: Task) => void;
  subtasks: Task[];
  projectTeam: { name: string; image: string }[];
}

export function TaskDialog({
  open,
  setOpen,
  task,
  isNewTask,
  onSave,
  onDelete,
  onAddSubtask,
  subtasks,
  projectTeam,
}: TaskDialogProps) {
  const [editMode, setEditMode] = useState(isNewTask);
  const [formData, setFormData] = useState<Task>(task);
  const [date, setDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );

  // Debug effect
  useEffect(() => {
    console.log("TaskDialog rendered:", {
      open,
      taskId: task.id,
      taskName: task.name,
      editMode,
    });
  }, [open, task.id, task.name, editMode]);

  // Update form data when task changes
  useEffect(() => {
    setFormData(task);
    setDate(task.dueDate ? new Date(task.dueDate) : undefined);
  }, [task]);

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

  // Handle input changes
  const handleChange = (field: keyof Task, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Handle date change
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      handleChange("dueDate", format(newDate, "MMM dd, yyyy"));
    }
  };

  // Handle save
  const handleSave = () => {
    onSave(formData);
  };

  // Handle delete
  const handleDelete = () => {
    onDelete(task.id);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  // Render view mode
  const renderViewMode = () => (
    <>
      <DialogHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <DialogTitle className="text-xl">{task.name}</DialogTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{task.id}</span>
              {task.parentId && <span>• Subtask</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAddSubtask(task)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subtask
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DialogHeader>

      <div className="grid gap-6 py-4">
        {/* Task details */}
        <div className="space-y-4">
          {task.description && (
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Status</h3>
              <div className="flex items-center gap-2">
                {task.status === "Done" ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{task.status}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Priority</h3>
              <Badge
                className={getPriorityColor(task.priority)}
                variant="outline"
              >
                {task.priority}
              </Badge>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Due Date</h3>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{task.dueDate}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Assignee</h3>
              <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>

        {/* Subtasks section */}
        {subtasks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Subtasks</h3>
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => {
                      onSave(task); // Save current task
                      setFormData(subtask); // Set form data to subtask
                      setOpen(true); // Reopen dialog with subtask
                    }, 100);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 border-l-2 h-4"></div>
                        <span className="font-medium">{subtask.name}</span>
                      </div>
                      <div className="ml-8 text-xs text-muted-foreground mt-1">
                        {subtask.id} • {subtask.status}
                      </div>
                    </div>
                    <Badge
                      className={getPriorityColor(subtask.priority)}
                      variant="outline"
                    >
                      {subtask.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-2"
              size="sm"
              onClick={() => onAddSubtask(task)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subtask
            </Button>
          </div>
        )}

        {/* Comments section placeholder */}
        <div>
          <h3 className="text-sm font-medium mb-2">Comments</h3>
          <div className="p-4 bg-muted/50 rounded-md text-center text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4 mx-auto mb-2" />
            No comments yet
          </div>
        </div>
      </div>
    </>
  );

  // Render edit mode
  const renderEditMode = () => (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <div className="flex items-start justify-between">
          <DialogTitle>{isNewTask ? "New Task" : "Edit Task"}</DialogTitle>
          {!isNewTask && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Task Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter task name"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Enter task description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Backlog">Backlog</SelectItem>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                handleChange("priority", value as "High" | "Medium" | "Low")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              value={formData.assignee.name || ""}
              onValueChange={(value) => {
                const assignee = projectTeam.find(
                  (member) => member.name === value
                );
                if (assignee) {
                  handleChange("assignee", assignee);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {projectTeam.map((member) => (
                  <SelectItem key={member.name} value={member.name}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DialogFooter>
        {!isNewTask && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setEditMode(false)}
          >
            Cancel
          </Button>
        )}
        <Button type="submit">
          {isNewTask ? "Create Task" : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <>
      {open && (
        <Dialog open={open} onOpenChange={setOpen} modal={true}>
          <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
            {editMode ? renderEditMode() : renderViewMode()}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
