"use client";

import ProtectedRoute from "@/lib/protected-route";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
