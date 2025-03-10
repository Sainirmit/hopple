import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { ToastProvider } from "@/components/ui/use-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hopple - AI-Powered Project Management",
  description:
    "Automate task creation, prioritization, and management with AI agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <div className="flex h-screen overflow-hidden">
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="w-full overflow-auto">
                  <div className="min-h-full">{children}</div>
                </SidebarInset>
              </SidebarProvider>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
