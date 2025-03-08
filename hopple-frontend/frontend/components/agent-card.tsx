import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Cpu, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AgentCardProps {
  name: string
  description: string
  status: "Active" | "Sleeping" | "Terminated" | "Error"
  activity: string
  performance: number
}

export function AgentCard({ name, description, status, activity, performance }: AgentCardProps) {
  // Determine status color
  const getStatusColor = () => {
    switch (status) {
      case "Active":
        return "text-emerald-500"
      case "Sleeping":
        return "text-amber-500"
      case "Error":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6E2CF4] to-[#FF2B8F]">
              <Cpu className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-base font-semibold">{name}</CardTitle>
          </div>
          <Switch checked={status === "Active"} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-2">
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Performance</span>
            <span className="font-medium">{performance}%</span>
          </div>
          <Progress value={performance} className="h-2" />
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Recent Activity</p>
          <p className="text-sm">{activity}</p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-3">
        <div className={`flex items-center gap-1.5 text-xs ${getStatusColor()}`}>
          <span
            className={`h-2 w-2 rounded-full ${status === "Active" ? "animate-pulse bg-emerald-500" : "bg-current"}`}
          />
          <span className="font-medium">{status}</span>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Configure Agent</span>
        </Button>
      </CardFooter>
    </Card>
  )
}

