"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { TaskCard } from "@/components/task-card";
import { TaskColumn } from "@/components/task-column";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Task } from "@/types/task";

interface TaskBoardProps {
  projectId: string;
  projectName: string;
}

export function TaskBoard({ projectId, projectName }: TaskBoardProps) {
  // Mock tasks - in a real app these would come from an API
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "TASK-1234",
      name: "Design homepage wireframes",
      description:
        "Create wireframes for the new homepage layout based on the brand guidelines. Include desktop and mobile versions.",
      project: projectName,
      priority: "High",
      status: "In Progress",
      dueDate: "Mar 12, 2025",
      assignee: {
        name: "Sarah",
        image: "/placeholder.svg?height=32&width=32",
      },
      aiCreated: true,
    },
    {
      id: "TASK-1235",
      name: "Implement authentication flow",
      description:
        "Set up the login and signup forms with validation. Integrate with the backend API.",
      project: projectName,
      priority: "Medium",
      status: "To Do",
      dueDate: "Mar 15, 2025",
      assignee: {
        name: "Mike",
        image: "/placeholder.svg?height=32&width=32",
      },
      aiCreated: true,
    },
    {
      id: "TASK-1236",
      name: "User testing for homepage design",
      description:
        "Conduct user testing sessions to gather feedback on the new homepage design.",
      project: projectName,
      priority: "Medium",
      status: "Backlog",
      dueDate: "Mar 20, 2025",
      assignee: {
        name: "Emma",
        image: "/placeholder.svg?height=32&width=32",
      },
      aiCreated: false,
    },
    {
      id: "TASK-1237",
      name: "Fix navigation dropdown bug",
      description:
        "The dropdown menu in the navigation bar isn't closing properly on mobile devices.",
      project: projectName,
      priority: "High",
      status: "To Do",
      dueDate: "Mar 14, 2025",
      assignee: {
        name: "John",
        image: "/placeholder.svg?height=32&width=32",
      },
      aiCreated: false,
    },
    {
      id: "TASK-1238",
      name: "Optimize image loading",
      description:
        "Implement lazy loading for images to improve page load performance.",
      project: projectName,
      priority: "Low",
      status: "Done",
      dueDate: "Mar 10, 2025",
      assignee: {
        name: "Alex",
        image: "/placeholder.svg?height=32&width=32",
      },
      aiCreated: false,
    },
    {
      id: "TASK-1239",
      name: "Create color palette for design system",
      description:
        "Define the primary, secondary, and accent colors for the new design system.",
      project: projectName,
      priority: "Medium",
      status: "Done",
      dueDate: "Mar 08, 2025",
      assignee: {
        name: "Sarah",
        image: "/placeholder.svg?height=32&width=32",
      },
      aiCreated: true,
    },
    {
      id: "TASK-1240",
      name: "Design mobile navigation menu",
      description: "Create designs for responsive mobile navigation menu.",
      project: projectName,
      priority: "High",
      status: "In Progress",
      dueDate: "Mar 13, 2025",
      assignee: {
        name: "Sarah",
        image: "/placeholder.svg?height=32&width=32",
      },
      aiCreated: false,
      parentId: "TASK-1234", // This is a subtask of the homepage wireframes task
    },
    {
      id: "TASK-1241",
      name: "Implement hero section design",
      description: "Code the hero section based on the approved wireframes.",
      project: projectName,
      priority: "Medium",
      status: "To Do",
      dueDate: "Mar 16, 2025",
      assignee: {
        name: "Mike",
        image: "/placeholder.svg?height=32&width=32",
      },
      aiCreated: false,
      parentId: "TASK-1234", // This is a subtask of the homepage wireframes task
    },
  ]);

  // Drag and drop state
  const [activeId, setActiveId] = useState<string | null>(null);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group tasks by status
  const backlogTasks = tasks.filter(
    (task) => task.status === "Backlog" && !task.parentId
  );
  const todoTasks = tasks.filter(
    (task) => task.status === "To Do" && !task.parentId
  );
  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress" && !task.parentId
  );
  const doneTasks = tasks.filter(
    (task) => task.status === "Done" && !task.parentId
  );

  // Get subtasks for a parent task
  const getSubtasks = (parentId: string) => {
    return tasks.filter((task) => task.parentId === parentId);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find the task that was dragged
      const task = tasks.find((t) => t.id === active.id);

      if (task) {
        // Update the task's status based on the column it was dropped in
        const newStatus = over.id as
          | "Backlog"
          | "To Do"
          | "In Progress"
          | "Done";
        const updatedTasks = tasks.map((t) => {
          if (t.id === task.id) {
            return { ...t, status: newStatus };
          }
          return t;
        });

        setTasks(updatedTasks);
      }
    }

    setActiveId(null);
  };

  // Handle adding a new task
  const handleAddTask = (
    status: "Backlog" | "To Do" | "In Progress" | "Done"
  ) => {
    const newTask: Task = {
      id: `TASK-${Math.floor(Math.random() * 10000)}`, // In a real app, this would come from the server
      name: "",
      description: "",
      project: projectName,
      priority: "Medium" as "High" | "Medium" | "Low",
      status: status,
      dueDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      assignee: {
        name: "",
        image: "/placeholder.svg?height=32&width=32",
      },
      aiCreated: false,
    };

    // Add the new task
    setTasks([...tasks, newTask]);

    // Navigate to the task detail page
    window.location.href = `/projects/${projectId}/tasks/${newTask.id}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Backlog column */}
          <TaskColumn
            title="Backlog"
            count={backlogTasks.length}
            status="Backlog"
            onAddTask={() => handleAddTask("Backlog")}
          >
            {backlogTasks.map((task) => (
              <div key={task.id} className="mb-2">
                <TaskCard
                  task={task}
                  subtasks={getSubtasks(task.id)}
                  projectId={projectId}
                />
              </div>
            ))}
          </TaskColumn>

          {/* To Do column */}
          <TaskColumn
            title="To Do"
            count={todoTasks.length}
            status="To Do"
            onAddTask={() => handleAddTask("To Do")}
          >
            {todoTasks.map((task) => (
              <div key={task.id} className="mb-2">
                <TaskCard
                  task={task}
                  subtasks={getSubtasks(task.id)}
                  projectId={projectId}
                />
              </div>
            ))}
          </TaskColumn>

          {/* In Progress column */}
          <TaskColumn
            title="In Progress"
            count={inProgressTasks.length}
            status="In Progress"
            onAddTask={() => handleAddTask("In Progress")}
          >
            {inProgressTasks.map((task) => (
              <div key={task.id} className="mb-2">
                <TaskCard
                  task={task}
                  subtasks={getSubtasks(task.id)}
                  projectId={projectId}
                />
              </div>
            ))}
          </TaskColumn>

          {/* Done column */}
          <TaskColumn
            title="Done"
            count={doneTasks.length}
            status="Done"
            onAddTask={() => handleAddTask("Done")}
          >
            {doneTasks.map((task) => (
              <div key={task.id} className="mb-2">
                <TaskCard
                  task={task}
                  subtasks={getSubtasks(task.id)}
                  projectId={projectId}
                />
              </div>
            ))}
          </TaskColumn>
        </DndContext>
      </div>
    </div>
  );
}
