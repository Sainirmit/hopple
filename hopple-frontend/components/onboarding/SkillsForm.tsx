"use client";

import React, { useState } from "react";
import { useOnboarding } from "../../lib/context/OnboardingContext";
import { Button } from "../ui/Button";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";

export function SkillsForm() {
  const { onboardingData, updateOnboardingData, setCurrentStep } =
    useOnboarding();
  const [skills, setSkills] = useState<string[]>(onboardingData.skills || []);
  const [newSkill, setNewSkill] = useState<string>("");
  const [bio, setBio] = useState<string>(onboardingData.bio || "");

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOnboardingData({ skills, bio });
    setCurrentStep("preferences");
  };

  const handleBack = () => {
    updateOnboardingData({ skills, bio });
    setCurrentStep("professional");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="skills"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Skills & Expertise
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="skills"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 block w-full rounded-l-md border-gray-300 dark:border-dark-700 focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-900 dark:text-white sm:text-sm"
            placeholder="Add a skill (e.g. JavaScript, Project Management)"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-dark-700 rounded-r-md bg-gray-50 dark:bg-dark-800 text-gray-500 dark:text-gray-400 sm:text-sm"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Skills tags */}
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div
              key={skill}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Bio (Optional)
        </label>
        <textarea
          id="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-900 dark:text-white sm:text-sm"
          placeholder="Tell us a bit about yourself..."
        />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
