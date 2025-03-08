"use client";

import React, { useEffect } from "react";
import { useOnboarding } from "../../lib/context/OnboardingContext";
import { Button } from "../ui/Button";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export function OnboardingComplete() {
  const { onboardingData, completeOnboarding } = useOnboarding();
  const router = useRouter();

  // Complete the onboarding process
  useEffect(() => {
    const finishOnboarding = async () => {
      try {
        await completeOnboarding();
      } catch (error) {
        console.error("Error completing onboarding:", error);
      }
    };

    finishOnboarding();
  }, [completeOnboarding]);

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500" />
      </div>

      <h3 className="text-xl font-medium text-gray-900 dark:text-white">
        Onboarding Complete!
      </h3>

      <p className="text-gray-600 dark:text-gray-400">
        Thank you for setting up your profile, {onboardingData.name}. You're all
        set to start using Hopple!
      </p>

      <div className="pt-4">
        <Button onClick={handleContinue}>Go to Dashboard</Button>
      </div>
    </div>
  );
}
