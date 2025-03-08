import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, ChevronLeft, Github, Globe, Lock, Mail, Moon, Paintbrush, Sun, Upload, User } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <main className="flex-1 p-6">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-6 md:space-y-0">
              <div className="md:w-1/4">
                <TabsList className="flex flex-col h-auto p-0 bg-transparent space-y-1">
                  <TabsTrigger value="profile" className="justify-start data-[state=active]:bg-muted">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="justify-start data-[state=active]:bg-muted">
                    <Paintbrush className="mr-2 h-4 w-4" />
                    Appearance
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="justify-start data-[state=active]:bg-muted">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="security" className="justify-start data-[state=active]:bg-muted">
                    <Lock className="mr-2 h-4 w-4" />
                    Security
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 space-y-4">
                <TabsContent value="profile" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile</CardTitle>
                      <CardDescription>Manage your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src="/placeholder.svg?height=96&width=96" alt="User" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Change Avatar
                          </Button>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="first-name">First name</Label>
                              <Input id="first-name" defaultValue="John" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="last-name">Last name</Label>
                              <Input id="last-name" defaultValue="Doe" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" defaultValue="john.doe@example.com" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Input id="bio" defaultValue="Product Manager at Acme Inc." />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
                        Save Changes
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Work Information</CardTitle>
                      <CardDescription>Update your professional details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="job-title">Job Title</Label>
                        <Input id="job-title" defaultValue="Product Manager" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" defaultValue="Product" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills</Label>
                        <Input id="skills" defaultValue="Project Management, UX Design, Marketing, Data Analysis" />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
                        Save Changes
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                      <CardDescription>Customize the look and feel of the interface</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="theme">Theme</Label>
                            <p className="text-sm text-muted-foreground">Select your preferred theme</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="icon">
                              <Sun className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="bg-muted">
                              <Moon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Sidebar Position</Label>
                            <p className="text-sm text-muted-foreground">Choose where the sidebar appears</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="bg-muted">
                              Left
                            </Button>
                            <Button variant="outline" size="sm">
                              Right
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="font-medium">Interface Density</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="h-20 w-full rounded-md border-2 border-primary bg-muted/50 p-2">
                              <div className="h-2 w-3/4 rounded-sm bg-primary/30 mb-1" />
                              <div className="h-2 w-full rounded-sm bg-primary/30 mb-1" />
                              <div className="h-2 w-1/2 rounded-sm bg-primary/30" />
                            </div>
                            <span className="text-xs">Compact</span>
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            <div className="h-20 w-full rounded-md border-2 border-muted bg-muted/20 p-2">
                              <div className="h-3 w-3/4 rounded-sm bg-muted mb-2" />
                              <div className="h-3 w-full rounded-sm bg-muted mb-2" />
                              <div className="h-3 w-1/2 rounded-sm bg-muted" />
                            </div>
                            <span className="text-xs">Default</span>
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            <div className="h-20 w-full rounded-md border-2 border-muted bg-muted/20 p-2">
                              <div className="h-4 w-3/4 rounded-sm bg-muted mb-3" />
                              <div className="h-4 w-full rounded-sm bg-muted mb-3" />
                              <div className="h-4 w-1/2 rounded-sm bg-muted" />
                            </div>
                            <span className="text-xs">Comfortable</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button variant="outline">Reset to Default</Button>
                      <Button className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
                        Save Preferences
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>Configure how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { title: "Project Updates", description: "Get notified when a project is updated" },
                        { title: "Task Assignments", description: "Get notified when you're assigned a new task" },
                        { title: "Comments", description: "Get notified when someone comments on your task" },
                        { title: "AI Agent Activities", description: "Get notified about AI agent automated actions" },
                        { title: "Due Date Reminders", description: "Get reminders about upcoming deadlines" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start justify-between space-x-4">
                          <div className="space-y-1">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <Switch defaultChecked={i !== 3} />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Bell className="h-4 w-4 text-muted-foreground" />
                              <Switch defaultChecked={i !== 4} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
                        Save Preferences
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Password</CardTitle>
                      <CardDescription>Change your password</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
                        Update Password
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                      <CardDescription>Add an extra layer of security to your account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">Protect your account with 2FA</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Connected Accounts</CardTitle>
                      <CardDescription>Manage accounts connected to your profile</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Github className="h-6 w-6" />
                          <div className="space-y-1">
                            <p className="font-medium">GitHub</p>
                            <p className="text-sm text-muted-foreground">Connected as johndoe</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Globe className="h-6 w-6" />
                          <div className="space-y-1">
                            <p className="font-medium">Google</p>
                            <p className="text-sm text-muted-foreground">Not connected</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Delete Account</CardTitle>
                      <CardDescription>Permanently delete your account and all data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-destructive">Delete Account</p>
                          <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                        </div>
                        <Button variant="destructive">Delete Account</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

