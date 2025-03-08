"use client";

import React, { useState } from "react";
import { useOnboarding } from "../../lib/context/OnboardingContext";
import { Button } from "../ui/Button";

export function PreferencesForm() {
  const { onboardingData, updateOnboardingData, setCurrentStep } =
    useOnboarding();
  const [emailNotifications, setEmailNotifications] = useState<boolean>(
    onboardingData.notificationPreferences?.email ?? true
  );
  const [inAppNotifications, setInAppNotifications] = useState<boolean>(
    onboardingData.notificationPreferences?.inApp ?? true
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOnboardingData({
      notificationPreferences: {
        email: emailNotifications,
        inApp: inAppNotifications,
      },
    });
    setCurrentStep("complete");
  };

  const handleBack = () => {
    updateOnboardingData({
      notificationPreferences: {
        email: emailNotifications,
        inApp: inAppNotifications,
      },
    });
    setCurrentStep("skills");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Notification Preferences
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Choose how you'd like to be notified about updates and changes.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="email-notifications"
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-dark-700 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="email-notifications"
              className="font-medium text-gray-700 dark:text-gray-300"
            >
              Email Notifications
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Receive updates, task assignments, and project changes via email.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="in-app-notifications"
              type="checkbox"
              checked={inAppNotifications}
              onChange={(e) => setInAppNotifications(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-dark-700 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="in-app-notifications"
              className="font-medium text-gray-700 dark:text-gray-300"
            >
              In-App Notifications
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Receive notifications within the application when you're online.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button type="submit">Complete Setup</Button>
      </div>
    </form>
  );
}
