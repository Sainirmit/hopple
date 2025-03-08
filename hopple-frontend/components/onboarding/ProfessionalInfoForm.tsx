"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOnboarding } from "../../lib/context/OnboardingContext";
import { Button } from "../ui/Button";

// Validation schema
const professionalInfoSchema = z.object({
  role: z.string().min(2, "Role must be at least 2 characters"),
  workExperience: z.coerce
    .number()
    .min(0, "Work experience must be a positive number"),
  field: z.string().min(2, "Field must be at least 2 characters"),
});

type ProfessionalInfoFormValues = z.infer<typeof professionalInfoSchema>;

export function ProfessionalInfoForm() {
  const { onboardingData, updateOnboardingData, setCurrentStep } =
    useOnboarding();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfessionalInfoFormValues>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      role: onboardingData.role || "",
      workExperience: onboardingData.workExperience || 0,
      field: onboardingData.field || "",
    },
  });

  const onSubmit = (data: ProfessionalInfoFormValues) => {
    updateOnboardingData(data);
    setCurrentStep("skills");
  };

  const handleBack = () => {
    setCurrentStep("personal");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Job Title / Role
        </label>
        <input
          id="role"
          type="text"
          {...register("role")}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-900 dark:text-white sm:text-sm"
          placeholder="e.g. Software Engineer, Project Manager"
        />
        {errors.role && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.role.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="workExperience"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Years of Experience
        </label>
        <input
          id="workExperience"
          type="number"
          min="0"
          step="1"
          {...register("workExperience")}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-900 dark:text-white sm:text-sm"
        />
        {errors.workExperience && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.workExperience.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="field"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Field / Industry
        </label>
        <select
          id="field"
          {...register("field")}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-900 dark:text-white sm:text-sm"
        >
          <option value="">Select a field</option>
          <option value="Software Development">Software Development</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="Finance">Finance</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Operations">Operations</option>
          <option value="Other">Other</option>
        </select>
        {errors.field && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.field.message}
          </p>
        )}
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
