"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Search,
  Book,
  HelpCircle,
  LifeBuoy,
  CheckCircle,
  MessageSquare,
  Mail,
  Phone,
  ExternalLink,
  PlayCircle,
  FileText,
  ChevronRight,
  PanelLeft,
  Users,
  Calendar,
  BarChart,
  Settings,
  Cpu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("guides");
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([]);

  // Sample FAQs
  const faqs = [
    {
      question: "How do I create a new project?",
      answer:
        "Click on the 'New Project' button at the top of the sidebar. Fill in the project details in the form and click 'Create Project'. Your new project will appear in the Projects list.",
    },
    {
      question: "Can I invite team members to my workspace?",
      answer:
        "Yes! Go to the Team section in the sidebar, then click 'Invite Team Member'. Enter their email address and set their permissions. They'll receive an invitation email to join your workspace.",
    },
    {
      question: "How do the AI agents work?",
      answer:
        "Our AI agents use advanced machine learning to help you manage your work. Each agent has a specific purpose - Task Creator helps you break down work, Prioritizer helps you focus on what matters, Worker Assigner matches tasks to people, and Meeting Summarizer captures important points from discussions.",
    },
    {
      question: "Can I export my data from Hopple?",
      answer:
        "Yes, you can export your data from Settings > Data Management > Export Data. You can choose to export all data or select specific projects and date ranges.",
    },
    {
      question: "How secure is my data on Hopple?",
      answer:
        "We take security very seriously. Hopple uses bank-level encryption for all your data, both in transit and at rest. We also use multi-factor authentication and regular security audits to ensure your information stays protected.",
    },
    {
      question: "Is there a mobile app available?",
      answer:
        "Yes, Hopple is available on iOS and Android. You can download our mobile app from the App Store or Google Play Store. It provides most of the same features as the web version, optimized for mobile use.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), as well as PayPal. For enterprise plans, we also offer invoice payments with net-30 terms.",
    },
    {
      question: "How do I cancel my subscription?",
      answer:
        "You can cancel your subscription at any time from Settings > Billing > Subscription Management > Cancel Subscription. Your account will remain active until the end of your current billing period.",
    },
  ];

  // Sample guides
  const guides = [
    {
      id: "getting-started",
      title: "Getting Started with Hopple",
      description: "Learn the basics of Hopple and set up your workspace",
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      time: "5 min read",
      category: "Basics",
    },
    {
      id: "projects",
      title: "Managing Projects",
      description: "Create, organize, and track projects effectively",
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      time: "8 min read",
      category: "Projects",
    },
    {
      id: "team",
      title: "Team Collaboration",
      description: "Invite team members and manage permissions",
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      time: "6 min read",
      category: "Team",
    },
    {
      id: "ai-agents",
      title: "Using AI Agents",
      description: "Leverage AI to automate your workflow",
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      time: "10 min read",
      category: "AI Agents",
    },
    {
      id: "calendar",
      title: "Calendar Management",
      description: "Schedule meetings and track deadlines",
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      time: "7 min read",
      category: "Calendar",
    },
    {
      id: "analytics",
      title: "Understanding Analytics",
      description: "Track progress and generate insights",
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      time: "9 min read",
      category: "Analytics",
    },
  ];

  // Sample video tutorials
  const videoTutorials = [
    {
      id: "intro",
      title: "Introduction to Hopple",
      description: "A complete overview of the Hopple platform",
      thumbnail: "/placeholder.svg?height=100&width=180",
      duration: "4:32",
      category: "Basics",
    },
    {
      id: "projects",
      title: "Project Management Basics",
      description: "Learn how to create and manage projects",
      thumbnail: "/placeholder.svg?height=100&width=180",
      duration: "6:15",
      category: "Projects",
    },
    {
      id: "task-creator",
      title: "Using the Task Creator AI",
      description: "Leverage AI to generate tasks automatically",
      thumbnail: "/placeholder.svg?height=100&width=180",
      duration: "5:48",
      category: "AI Agents",
    },
    {
      id: "analytics",
      title: "Interpreting Analytics Data",
      description: "Make sense of your project metrics",
      thumbnail: "/placeholder.svg?height=100&width=180",
      duration: "7:22",
      category: "Analytics",
    },
  ];

  // Filter function for search
  const filterItems = (query: string, items: any[], searchField: string) => {
    if (!query) return items;
    const lowercasedQuery = query.toLowerCase();
    return items.filter((item) =>
      item[searchField].toLowerCase().includes(lowercasedQuery)
    );
  };

  // Filtered items based on search
  const filteredFaqs = filterItems(searchQuery, faqs, "question");
  const filteredGuides = filterItems(searchQuery, guides, "title");
  const filteredVideos = filterItems(searchQuery, videoTutorials, "title");

  // Toggle FAQ open/closed state
  const toggleFaq = (index: number) => {
    setOpenFaqIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Help Center</h1>
                <p className="text-muted-foreground">
                  Find guides, tutorials, and answers to common questions
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help, guides, or FAQs..."
              className="w-full pl-10 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="guides">
                      <Book className="h-4 w-4 mr-2" />
                      Guides
                    </TabsTrigger>
                    <TabsTrigger value="videos">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Video Tutorials
                    </TabsTrigger>
                    <TabsTrigger value="faqs">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      FAQs
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="guides" className="mt-4">
                    <div className="space-y-4">
                      {searchQuery && filteredGuides.length === 0 ? (
                        <div className="py-8 text-center">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium">
                            No guides found
                          </h3>
                          <p className="text-muted-foreground">
                            Try adjusting your search query
                          </p>
                        </div>
                      ) : (
                        filteredGuides.map((guide) => (
                          <Card key={guide.id} className="overflow-hidden">
                            <Link
                              href={`#${guide.id}`}
                              className="block hover:bg-muted/50 transition-colors"
                            >
                              <div className="p-4 sm:p-6 flex items-start gap-4">
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 shrink-0">
                                  {guide.icon}
                                </div>
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-medium">
                                      {guide.title}
                                    </h3>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <p className="text-muted-foreground text-sm">
                                    {guide.description}
                                  </p>
                                  <div className="flex items-center gap-3 pt-1">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {guide.category}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {guide.time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="videos" className="mt-4">
                    <div className="space-y-4">
                      {searchQuery && filteredVideos.length === 0 ? (
                        <div className="py-8 text-center">
                          <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium">
                            No videos found
                          </h3>
                          <p className="text-muted-foreground">
                            Try adjusting your search query
                          </p>
                        </div>
                      ) : (
                        filteredVideos.map((video) => (
                          <Card key={video.id} className="overflow-hidden">
                            <Link
                              href={`#${video.id}`}
                              className="block hover:bg-muted/50 transition-colors"
                            >
                              <div className="p-4 sm:p-6 grid sm:grid-cols-4 gap-4">
                                <div className="relative rounded-md overflow-hidden bg-muted">
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-auto object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-10 w-10 rounded-full bg-black/60 flex items-center justify-center">
                                      <PlayCircle className="h-5 w-5 text-white" />
                                    </div>
                                  </div>
                                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                    {video.duration}
                                  </div>
                                </div>
                                <div className="sm:col-span-3 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-medium">
                                      {video.title}
                                    </h3>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <p className="text-muted-foreground text-sm">
                                    {video.description}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs mt-1"
                                  >
                                    {video.category}
                                  </Badge>
                                </div>
                              </div>
                            </Link>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="faqs" className="mt-4">
                    {searchQuery && filteredFaqs.length === 0 ? (
                      <div className="py-8 text-center">
                        <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No FAQs found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your search query
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredFaqs.map((faq, index) => {
                          const isOpen = openFaqIndices.includes(index);
                          return (
                            <div
                              key={index}
                              className="border rounded-md overflow-hidden"
                            >
                              <button
                                className="flex w-full items-center justify-between px-4 py-3 text-left font-medium focus:outline-none"
                                onClick={() => toggleFaq(index)}
                              >
                                {faq.question}
                                {isOpen ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                              {isOpen && (
                                <div className="px-4 pb-3 pt-0 text-muted-foreground text-sm">
                                  {faq.answer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardHeader>
              <CardContent>
                {/* Empty CardContent - content is now in the TabsContent components */}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LifeBuoy className="mr-2 h-5 w-5" />
                    Contact Support
                  </CardTitle>
                  <CardDescription>
                    Get help from our support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Live Chat</h3>
                      <p className="text-sm text-muted-foreground">
                        Chat with our support team
                      </p>
                    </div>
                    <Button size="sm">Start Chat</Button>
                  </div>

                  <div className="rounded-lg border p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Email Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Get help via email
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Send Email
                    </Button>
                  </div>

                  <div className="rounded-lg border p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Phone Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Premium plan feature
                      </p>
                    </div>
                    <Button size="sm" variant="outline" disabled>
                      Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Topics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link
                    href="#"
                    className="block p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <PanelLeft className="h-4 w-4 text-muted-foreground" />
                      <span>Using the Dashboard</span>
                    </div>
                  </Link>
                  <Link
                    href="#"
                    className="block p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Calendar Management</span>
                    </div>
                  </Link>
                  <Link
                    href="#"
                    className="block p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Team Collaboration</span>
                    </div>
                  </Link>
                  <Link
                    href="#"
                    className="block p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span>AI Agents Overview</span>
                    </div>
                  </Link>
                  <Link
                    href="#"
                    className="block p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                      <span>Analytics Reporting</span>
                    </div>
                  </Link>
                  <Link
                    href="#"
                    className="block p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span>Account Settings</span>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <div className="rounded-lg border p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ExternalLink className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Visit our detailed documentation
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  View Docs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
