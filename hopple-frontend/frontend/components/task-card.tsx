"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, ChevronRight, ExternalLink } from "lucide-react";
import { Task } from "@/types/task";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  subtasks: Task[];
  projectId: string;
}

export function TaskCard({ task, subtasks, projectId }: TaskCardProps) {
  // Setup sortable item
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id,
      disabled: false,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get priority badge color
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

  // Generate the task detail URL
  const taskDetailUrl = `/projects/${projectId}/tasks/${task.id}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 pb-8 bg-background rounded-md border shadow-sm transition-all duration-200 relative z-20
                hover:shadow-md hover:border-primary/30 hover:bg-primary/[0.03]
                dark:hover:border-primary/20 dark:hover:bg-primary/[0.05]
                transform hover:-translate-y-[2px]"
    >
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <span className="text-xs text-muted-foreground">{task.id}</span>
          <Badge className={getPriorityColor(task.priority)} variant="outline">
            {task.priority}
          </Badge>
        </div>

        <h3 className="font-medium">{task.name}</h3>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.image} alt={task.assignee.name} />
              <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>

            {task.aiCreated && (
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#6E2CF4]">
                <Cpu className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>

          {subtasks.length > 0 && (
            <span className="flex items-center text-xs text-muted-foreground">
              <span className="mr-1">{subtasks.length} subtasks</span>
              <ChevronRight className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>

      {/* Details button - using Link for better accessibility and SEO */}
      <Link href={taskDetailUrl} passHref>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute bottom-1 right-1 px-3 py-1 h-6 text-xs min-w-[70px]",
            "bg-primary/10 hover:bg-primary/30 text-primary rounded",
            "transition-all opacity-60 hover:opacity-100 font-medium",
            "z-50 group-hover:opacity-90" // Ensure button is always on top
          )}
          onClick={(e) => {
            // Prevent propagation to avoid conflicting with drag operations
            e.stopPropagation();
          }}
        >
          <ExternalLink className="h-3 w-3 mr-1.5" />
          Details
        </Button>
      </Link>

      {/* Full card clickable area - separate from drag handle */}
      <Link
        href={taskDetailUrl}
        className="absolute inset-0 z-40 cursor-pointer"
        onClick={(e) => {
          // We need to stop propagation to prevent conflicting with drag operations
          e.stopPropagation();
        }}
      />
    </div>
  );
}
