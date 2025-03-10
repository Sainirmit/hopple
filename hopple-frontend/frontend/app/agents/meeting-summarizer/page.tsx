"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Check,
  ChevronLeft,
  Cpu,
  History,
  Settings,
  CheckCircle2,
  AlertCircle,
  CircleHelp,
  Clock,
  ArrowRight,
  Upload,
  Mic,
  FileText,
  PlusCircle,
  Video,
  FileAudio,
  CheckCircle,
  ListTodo,
  Calendar,
  MessagesSquare,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MeetingSummarizerPage() {
  const [activeTab, setActiveTab] = useState("summarize");
  const [summarizing, setSummarizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [summaryType, setSummaryType] = useState("comprehensive");

  // Sample meeting history
  const meetingHistory = [
    {
      id: 1,
      title: "Product Roadmap Planning",
      date: "Mar 08, 2025",
      duration: "45 min",
      participants: 8,
      status: "completed",
    },
    {
      id: 2,
      title: "Sprint Retrospective",
      date: "Mar 06, 2025",
      duration: "30 min",
      participants: 12,
      status: "completed",
    },
    {
      id: 3,
      title: "Client Presentation Prep",
      date: "Mar 03, 2025",
      duration: "60 min",
      participants: 5,
      status: "completed",
    },
    {
      id: 4,
      title: "Marketing Strategy Session",
      date: "Feb 28, 2025",
      duration: "75 min",
      participants: 7,
      status: "completed",
    },
  ];

  // Sample summary results
  const sampleSummary = {
    title: "Product Roadmap Planning",
    date: "Mar 08, 2025",
    duration: "45 minutes",
    participants: [
      { name: "Alex Chen", role: "Product Manager", contributions: 12 },
      { name: "Sarah Wilson", role: "UX Designer", contributions: 8 },
      { name: "Mike Johnson", role: "Frontend Dev", contributions: 5 },
      { name: "Emma Davis", role: "Content Strategist", contributions: 7 },
    ],
    summary:
      "The team discussed Q2 roadmap priorities, focusing on the new checkout experience and mobile app improvements. Alex presented user feedback data showing 70% of users want simplified checkout. The team agreed to prioritize this feature for the next sprint. Sarah will prepare wireframes by next Tuesday.",
    keyPoints: [
      "Checkout redesign is top priority based on user feedback",
      "Mobile app performance improvements scheduled for mid-Q2",
      "New analytics dashboard postponed to Q3",
      "User testing for checkout redesign to begin in 2 weeks",
    ],
    actionItems: [
      {
        task: "Prepare checkout wireframes",
        assignee: "Sarah Wilson",
        deadline: "Mar 15",
      },
      {
        task: "Set up user testing sessions",
        assignee: "Alex Chen",
        deadline: "Mar 22",
      },
      {
        task: "Investigate payment API options",
        assignee: "Mike Johnson",
        deadline: "Mar 18",
      },
      {
        task: "Draft feature announcement copy",
        assignee: "Emma Davis",
        deadline: "Mar 25",
      },
    ],
    sentimentAnalysis: {
      overall: "Positive",
      engagement: 85,
      agreement: 90,
      enthusiasm: 75,
    },
  };

  // Function to handle summarization
  const handleSummarize = () => {
    if (!transcript) return;

    setSummarizing(true);

    // Simulate AI summarization with a timeout
    setTimeout(() => {
      setSummarizing(false);
    }, 3000);
  };

  // Helper to get status icon
  const getStatusIcon = (status: string) => {
    const icons = {
      completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      processing: <Clock className="h-4 w-4 text-amber-500" />,
      failed: <AlertCircle className="h-4 w-4 text-red-500" />,
    };
    return (
      icons[status as keyof typeof icons] || (
        <CircleHelp className="h-4 w-4 text-gray-400" />
      )
    );
  };

  // Helper to render sentiment color
  const getSentimentColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

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

        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#6E2CF4] to-[#FF2B8F]">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Meeting Summarizer</h1>
                <p className="text-muted-foreground">
                  AI agent that analyzes and summarizes your meetings
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="w-fit bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400"
            >
              <Check className="mr-1 h-3 w-3" /> Active
            </Badge>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 md:w-auto">
              <TabsTrigger value="summarize">
                <FileText className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                <span className="hidden md:inline-block lg:inline-block">
                  Summarize Meeting
                </span>
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                <span className="hidden md:inline-block lg:inline-block">
                  History
                </span>
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                <span className="hidden md:inline-block lg:inline-block">
                  Settings
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summarize" className="mt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Meeting Input</CardTitle>
                    <CardDescription>
                      Upload a meeting transcript or recording to summarize
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Meeting Title</Label>
                      <div className="flex gap-2">
                        <Select defaultValue="new">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select meeting" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New Meeting</SelectItem>
                            <SelectItem value="product">
                              Product Roadmap Planning
                            </SelectItem>
                            <SelectItem value="sprint">
                              Sprint Retrospective
                            </SelectItem>
                            <SelectItem value="client">
                              Client Presentation Prep
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <Label>Add Meeting Content</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="h-20 flex flex-col items-center justify-center gap-1"
                        >
                          <Upload className="h-5 w-5" />
                          <span className="text-xs">Upload File</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex flex-col items-center justify-center gap-1"
                        >
                          <Mic className="h-5 w-5" />
                          <span className="text-xs">Record Audio</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex flex-col items-center justify-center gap-1"
                        >
                          <Video className="h-5 w-5" />
                          <span className="text-xs">Record Video</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-20 flex flex-col items-center justify-center gap-1 bg-primary/5"
                        >
                          <PlusCircle className="h-5 w-5" />
                          <span className="text-xs">Link Meeting</span>
                        </Button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                          <FileText className="h-4 w-4" />
                        </div>
                        <Textarea
                          placeholder="Paste meeting transcript here..."
                          className="pl-10 min-h-[200px]"
                          value={transcript}
                          onChange={(e) => setTranscript(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Summary Type</Label>
                      <Select
                        value={summaryType}
                        onValueChange={setSummaryType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select summary type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprehensive">
                            Comprehensive
                          </SelectItem>
                          <SelectItem value="actionable">
                            Action Items Only
                          </SelectItem>
                          <SelectItem value="concise">
                            Concise Overview
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90"
                      onClick={handleSummarize}
                      disabled={summarizing || !transcript}
                    >
                      {summarizing ? (
                        <>
                          <Cpu className="mr-2 h-4 w-4 animate-pulse" />
                          Summarizing...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Summary
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle>Meeting Summary</CardTitle>
                    <CardDescription>
                      AI-generated summary with key insights and action items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!transcript ? (
                      <div className="py-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">
                          No meeting content
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Upload a recording, paste a transcript, or select a
                          previous meeting
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                              {sampleSummary.title}
                            </h2>
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="mr-1 h-3 w-3" />
                              {sampleSummary.date}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{sampleSummary.duration}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MessagesSquare className="h-3.5 w-3.5" />
                              <span>
                                {sampleSummary.participants.length} participants
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                              Meeting Participants
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {sampleSummary.participants.map(
                                (participant, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md text-sm"
                                  >
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback className="text-[10px]">
                                        {participant.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{participant.name}</span>
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] h-4 px-1"
                                    >
                                      {participant.contributions}
                                    </Badge>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Summary</h3>
                            <p className="text-muted-foreground">
                              {sampleSummary.summary}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-medium mb-2">Key Points</h3>
                            <ul className="space-y-1.5 text-muted-foreground">
                              {sampleSummary.keyPoints.map((point, i) => (
                                <li key={i} className="flex gap-2">
                                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="font-medium">Action Items</h3>
                          <div className="space-y-2">
                            {sampleSummary.actionItems.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-start gap-3">
                                  <ListTodo className="h-4 w-4 text-primary mt-0.5" />
                                  <div>
                                    <p className="font-medium">{item.task}</p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Avatar className="h-4 w-4">
                                        <AvatarFallback className="text-[8px]">
                                          {item.assignee.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{item.assignee}</span>
                                    </div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="ml-2">
                                  Due {item.deadline}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border p-4 bg-muted/20">
                          <h3 className="font-medium mb-3">
                            Meeting Sentiment Analysis
                          </h3>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Overall Mood</span>
                                <span className="text-emerald-500 font-medium">
                                  {sampleSummary.sentimentAnalysis.overall}
                                </span>
                              </div>
                              <Progress value={85} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Engagement</span>
                                <span
                                  className={`font-medium ${getSentimentColor(
                                    sampleSummary.sentimentAnalysis.engagement
                                  )}`}
                                >
                                  {sampleSummary.sentimentAnalysis.engagement}%
                                </span>
                              </div>
                              <Progress
                                value={
                                  sampleSummary.sentimentAnalysis.engagement
                                }
                                className="h-2"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Agreement</span>
                                <span
                                  className={`font-medium ${getSentimentColor(
                                    sampleSummary.sentimentAnalysis.agreement
                                  )}`}
                                >
                                  {sampleSummary.sentimentAnalysis.agreement}%
                                </span>
                              </div>
                              <Progress
                                value={
                                  sampleSummary.sentimentAnalysis.agreement
                                }
                                className="h-2"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Enthusiasm</span>
                                <span
                                  className={`font-medium ${getSentimentColor(
                                    sampleSummary.sentimentAnalysis.enthusiasm
                                  )}`}
                                >
                                  {sampleSummary.sentimentAnalysis.enthusiasm}%
                                </span>
                              </div>
                              <Progress
                                value={
                                  sampleSummary.sentimentAnalysis.enthusiasm
                                }
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Summary History</CardTitle>
                  <CardDescription>
                    Previous meeting summaries generated by the AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {meetingHistory.map((item) => (
                      <div
                        key={item.id}
                        className="border-b pb-6 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {item.date}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {item.duration} • {item.participants} participants
                          </span>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            View Summary
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Summarizer Settings</CardTitle>
                  <CardDescription>
                    Configure how the meeting summarizer agent works
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Agent Status</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Agent Activation</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable or disable the agent
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-summarize Calendar Meetings</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically summarize meetings from your calendar
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Summarize Recordings</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically transcribe and summarize meeting
                            recordings
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Summary Preferences</h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Default Summary Type</Label>
                        <Select defaultValue="comprehensive">
                          <SelectTrigger>
                            <SelectValue placeholder="Select summary type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="comprehensive">
                              Comprehensive
                            </SelectItem>
                            <SelectItem value="actionable">
                              Action Items Only
                            </SelectItem>
                            <SelectItem value="concise">
                              Concise Overview
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Include in Summary</Label>
                        <div className="grid gap-2">
                          <div className="flex items-center space-x-2">
                            <Switch id="key-points" defaultChecked />
                            <Label htmlFor="key-points" className="font-normal">
                              Key Discussion Points
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="action-items" defaultChecked />
                            <Label
                              htmlFor="action-items"
                              className="font-normal"
                            >
                              Action Items
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="decisions" defaultChecked />
                            <Label htmlFor="decisions" className="font-normal">
                              Decisions Made
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="sentiment" defaultChecked />
                            <Label htmlFor="sentiment" className="font-normal">
                              Sentiment Analysis
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="participation" defaultChecked />
                            <Label
                              htmlFor="participation"
                              className="font-normal"
                            >
                              Participation Statistics
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Summary Length</Label>
                        <Select defaultValue="medium">
                          <SelectTrigger>
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">
                              Short (1-2 paragraphs)
                            </SelectItem>
                            <SelectItem value="medium">
                              Medium (2-4 paragraphs)
                            </SelectItem>
                            <SelectItem value="detailed">
                              Detailed (4+ paragraphs)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Integrations</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Sync with Calendar</Label>
                          <p className="text-sm text-muted-foreground">
                            Connect with your calendar app
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Zoom Integration</Label>
                          <p className="text-sm text-muted-foreground">
                            Auto-capture Zoom meeting recordings
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Task Management</Label>
                          <p className="text-sm text-muted-foreground">
                            Export action items to task system
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end space-x-2">
                    <Button variant="outline">Reset to Defaults</Button>
                    <Button className="bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
