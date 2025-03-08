"use client";

import React from "react";
import { OnboardingProvider } from "../../lib/context/OnboardingContext";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  // Redirect to sign in if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
            Welcome to Hopple
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Let's set up your account to get started
          </p>
        </div>
        <OnboardingProvider>{children}</OnboardingProvider>
      </div>
    </div>
  );
}
