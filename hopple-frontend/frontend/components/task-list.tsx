import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Cpu, MoreHorizontal } from "lucide-react"

// Update the TaskList component to handle optional projectId prop
export function TaskList({ projectId }: { projectId?: string } = {}) {
  const tasks = [
    {
      id: "TASK-1234",
      name: "Design homepage wireframes",
      project: "Website Redesign",
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
      project: "Mobile App Development",
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
      name: "Create content strategy document",
      project: "Marketing Campaign",
      priority: "Low",
      status: "To Do",
      dueDate: "Mar 20, 2025",
      assignee: {
        name: "Emma",
        image: "/placeholder.svg?height=32&width=32",
      },
      aiCreated: false,
    },
    {
      id: "TASK-1237",
      name: "Develop API endpoints",
      project: "Mobile App Development",
      priority: "High",
      status: "In Progress",
      dueDate: "Mar 14, 2025",
      assignee: {
        name: "John",
        image: "/placeholder.svg?height=32&width=32",
      },
      aiCreated: true,
    },
    {
      id: "TASK-1238",
      name: "QA testing for login page",
      project: "Website Redesign",
      priority: "Medium",
      status: "To Do",
      dueDate: "Mar 18, 2025",
      assignee: {
        name: "Alex",
        image: "/placeholder.svg?height=32&width=32",
      },
      aiCreated: false,
    },
  ]

  // Filter tasks by project if projectId is provided
  const filteredTasks = projectId ? tasks.filter((task) => task.project === "Website Redesign") : tasks

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-destructive text-destructive-foreground"
      case "Medium":
        return "bg-amber-500 text-white"
      case "Low":
        return "bg-emerald-500 text-white"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/20 text-emerald-500 border-emerald-500/50"
      case "In Progress":
        return "bg-blue-500/20 text-blue-500 border-blue-500/50"
      case "To Do":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead>Task</TableHead>
            {!projectId && <TableHead>Project</TableHead>}
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{task.name}</span>
                  {task.aiCreated && (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#6E2CF4]">
                      <Cpu className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
              </TableCell>
              {!projectId && <TableCell>{task.project}</TableCell>}
              <TableCell>
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell>{task.dueDate}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.image} alt={task.assignee.name} />
                    <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{task.assignee.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Edit Task</DropdownMenuItem>
                    <DropdownMenuItem>Change Status</DropdownMenuItem>
                    <DropdownMenuItem>Reassign</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete Task</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

