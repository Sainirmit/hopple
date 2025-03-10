"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Task } from "@/types/task";
import { useRouter } from "next/navigation";

interface AddTaskButtonProps {
  projectId: string;
  projectName: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  defaultStatus?: "Backlog" | "To Do" | "In Progress" | "Done";
}

export function AddTaskButton({
  projectId,
  projectName,
  variant = "default",
  size = "default",
  className = "",
  defaultStatus = "To Do",
}: AddTaskButtonProps) {
  const router = useRouter();

  const handleAddTask = () => {
    // Generate a random task ID - in a real app, you'd get this from the API
    const taskId = `TASK-${Math.floor(Math.random() * 10000)}`;

    // Navigate to the new task page
    router.push(
      `/projects/${projectId}/tasks/${taskId}?new=true&status=${defaultStatus}`
    );
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddTask}
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Task
    </Button>
  );
}
