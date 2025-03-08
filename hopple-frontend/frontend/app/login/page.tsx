"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cpu, Github, LogIn } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login")

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - animated visualization */}
      <div className="hidden w-1/2 flex-col items-center justify-center bg-gradient-to-br from-[#6E2CF4] to-[#FF2B8F] p-10 lg:flex">
        <div className="relative max-w-lg">
          <div className="absolute -left-20 top-0 h-72 w-72 animate-pulse rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 h-80 w-80 animate-pulse rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative z-10 mb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white">
              <Cpu className="h-10 w-10 text-[#6E2CF4]" />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white">Hopple</h1>
            <p className="mx-auto max-w-md text-lg text-white/90">
              AI-powered project management that helps teams work smarter
            </p>
          </div>

          {/* AI visualization animation */}
          <div className="relative h-80 rounded-lg bg-black/20 p-4">
            <div className="grid h-full grid-cols-3 gap-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center rounded-md bg-white/10"
                  style={{
                    animation: `pulse ${(i % 5) + 2}s infinite alternate ${i * 0.1}s`,
                    height: `${Math.floor(Math.random() * 40) + 60}%`,
                  }}
                >
                  <Cpu className="h-5 w-5 text-white/50" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - authentication form */}
      <div className="flex w-full flex-1 flex-col items-center justify-center p-6 lg:w-1/2">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="lg:hidden">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#6E2CF4] to-[#FF2B8F]">
                <Cpu className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Welcome to Hopple</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@company.com" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" className="h-auto p-0 text-xs">
                    Forgot password?
                  </Button>
                </div>
                <Input id="password" type="password" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Button asChild className="w-full bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
                <Link href="/dashboard">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="w-full">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input id="email-signup" type="email" placeholder="name@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input id="password-signup" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <Button variant="link" className="h-auto p-0">
                      Terms of Service
                    </Button>{" "}
                    and{" "}
                    <Button variant="link" className="h-auto p-0">
                      Privacy Policy
                    </Button>
                  </Label>
                </div>
              </div>
              <Button asChild className="w-full bg-gradient-to-r from-[#6E2CF4] to-[#FF2B8F] hover:opacity-90">
                <Link href="/dashboard">Create Account</Link>
              </Button>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Button variant="link" className="h-auto p-0 text-sm">
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button variant="link" className="h-auto p-0 text-sm">
              Privacy Policy
            </Button>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

