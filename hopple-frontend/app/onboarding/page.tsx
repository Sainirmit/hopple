"use client";

import React, { useEffect } from "react";
import { useOnboarding } from "../../lib/context/OnboardingContext";
import { useRouter } from "next/navigation";
import { PersonalInfoForm } from "../../components/onboarding/PersonalInfoForm";
import { ProfessionalInfoForm } from "../../components/onboarding/ProfessionalInfoForm";
import { SkillsForm } from "../../components/onboarding/SkillsForm";
import { PreferencesForm } from "../../components/onboarding/PreferencesForm";
import { OnboardingComplete } from "../../components/onboarding/OnboardingComplete";

export default function Onboarding() {
  const { currentStep, isCompleted } = useOnboarding();
  const router = useRouter();

  // Redirect to dashboard if onboarding is completed
  useEffect(() => {
    if (isCompleted) {
      router.push("/dashboard");
    }
  }, [isCompleted, router]);

  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case "personal":
        return <PersonalInfoForm />;
      case "professional":
        return <ProfessionalInfoForm />;
      case "skills":
        return <SkillsForm />;
      case "preferences":
        return <PreferencesForm />;
      case "complete":
        return <OnboardingComplete />;
      default:
        return <PersonalInfoForm />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-dark-800 shadow-md rounded-lg p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentStep === "personal" && "Personal Information"}
            {currentStep === "professional" && "Professional Information"}
            {currentStep === "skills" && "Skills & Expertise"}
            {currentStep === "preferences" && "Preferences"}
            {currentStep === "complete" && "All Set!"}
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Step{" "}
            {currentStep === "personal"
              ? "1"
              : currentStep === "professional"
              ? "2"
              : currentStep === "skills"
              ? "3"
              : currentStep === "preferences"
              ? "4"
              : "5"}{" "}
            of 5
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
            style={{
              width:
                currentStep === "personal"
                  ? "20%"
                  : currentStep === "professional"
                  ? "40%"
                  : currentStep === "skills"
                  ? "60%"
                  : currentStep === "preferences"
                  ? "80%"
                  : "100%",
            }}
          ></div>
        </div>
      </div>

      {renderStep()}
    </div>
  );
}
