import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cpu, FileText, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface ProjectCardProps {
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  tasks: {
    completed: number;
    total: number;
  };
  members: {
    name: string;
    image: string;
  }[];
  agentStatus: "active" | "inactive";
  id?: string; // Add optional ID for the project
}

export function ProjectCard({
  title,
  description,
  progress,
  dueDate,
  tasks,
  members,
  agentStatus,
  id = title.toLowerCase().replace(/\s+/g, "-"), // Generate an ID from title if not provided
}: ProjectCardProps) {
  // Calculate days remaining
  const due = new Date(dueDate);
  const today = new Date();
  const daysRemaining = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine status color based on days remaining
  const getStatusColor = () => {
    if (daysRemaining < 3) return "text-destructive";
    if (daysRemaining < 7) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <Link href={`/projects/${id}`} className="block h-full cursor-pointer">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/projects/${id}`}>View Project</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/projects/${id}/edit`}>Edit Project</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Manage Team</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Archive Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Due Date</p>
              <p className={`font-medium ${getStatusColor()}`}>
                {dueDate} ({daysRemaining} days)
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Tasks</p>
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <p className="font-medium">
                  {tasks.completed}/{tasks.total} completed
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="flex -space-x-2">
            {members.map((member, i) => (
              <Avatar key={i} className="h-8 w-8 border-2 border-background">
                <AvatarImage src={member.image} alt={member.name} />
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
            ))}
            {members.length > 3 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                +{members.length - 3}
              </div>
            )}
          </div>
          <div
            className={`flex items-center gap-1.5 text-xs ${
              agentStatus === "active"
                ? "text-emerald-500"
                : "text-muted-foreground"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span className="font-medium capitalize">{agentStatus}</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
