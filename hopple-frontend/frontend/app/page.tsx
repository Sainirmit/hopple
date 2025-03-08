import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Cpu, LogIn } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#6E2CF4] to-[#FF2B8F]">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold">Hopple</h1>
        </div>
        <h2 className="text-2xl font-semibold mb-4">AI-Powered Project Management</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Automate task creation, prioritization, and management with intelligent AI agents
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg" className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
            <Link href="/dashboard">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Log In
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="managers" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="managers">For Project Managers</TabsTrigger>
          <TabsTrigger value="employees">For Employees</TabsTrigger>
        </TabsList>
        <TabsContent value="managers">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Task Creation</CardTitle>
                <CardDescription>Automated task generation from project requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-secondary p-2 flex items-center justify-center h-32">
                  <Cpu className="h-12 w-12 text-[#6E2CF4]" />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">AI analyzes requirements and creates structured tasks</p>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Resource Allocation</CardTitle>
                <CardDescription>Intelligent team member assignment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-secondary p-2 flex items-center justify-center h-32">
                  <Cpu className="h-12 w-12 text-[#FF2B8F]" />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">Match team skills with task requirements automatically</p>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>AI-powered analytics and reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-secondary p-2 flex items-center justify-center h-32">
                  <Cpu className="h-12 w-12 text-[#6E2CF4]" />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">Get actionable insights to improve project outcomes</p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="employees">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Smart Task Lists</CardTitle>
                <CardDescription>Prioritized and personalized tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-secondary p-2 flex items-center justify-center h-32">
                  <Cpu className="h-12 w-12 text-[#FF2B8F]" />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">Focus on what matters with AI-prioritized tasks</p>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Skill Development</CardTitle>
                <CardDescription>Personalized growth recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-secondary p-2 flex items-center justify-center h-32">
                  <Cpu className="h-12 w-12 text-[#6E2CF4]" />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">AI identifies skill gaps and suggests improvements</p>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Meeting Summaries</CardTitle>
                <CardDescription>Automated meeting notes and action items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-secondary p-2 flex items-center justify-center h-32">
                  <Cpu className="h-12 w-12 text-[#FF2B8F]" />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">Never miss important details from meetings again</p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

