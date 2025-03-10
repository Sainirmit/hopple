"use client";

import { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TaskColumnProps {
  title: string;
  count: number;
  status: "Backlog" | "To Do" | "In Progress" | "Done";
  children: ReactNode;
  onAddTask: () => void;
}

export function TaskColumn({
  title,
  count,
  status,
  children,
  onAddTask,
}: TaskColumnProps) {
  // Setup droppable area
  const { setNodeRef } = useDroppable({
    id: status,
  });

  // Get column header color based on status
  const getHeaderColor = (status: string) => {
    switch (status) {
      case "Backlog":
        return "bg-slate-100 dark:bg-slate-800";
      case "To Do":
        return "bg-blue-50 dark:bg-blue-950/30";
      case "In Progress":
        return "bg-amber-50 dark:bg-amber-950/30";
      case "Done":
        return "bg-emerald-50 dark:bg-emerald-950/30";
      default:
        return "bg-slate-100 dark:bg-slate-800";
    }
  };

  // Get badge color based on status
  const getBadgeColor = (status: string) => {
    switch (status) {
      case "Backlog":
        return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
      case "To Do":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "In Progress":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      case "Done":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
      default:
        return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  return (
    <div className="flex flex-col rounded-lg border h-[calc(100vh-350px)] min-h-[500px]">
      {/* Column Header */}
      <div
        className={`p-3 ${getHeaderColor(
          status
        )} border-b rounded-t-lg relative z-10`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{title}</h3>
            <Badge className={getBadgeColor(status)}>{count}</Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Task Container */}
      <div ref={setNodeRef} className="flex-1 p-2 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
