"use client";

import React, { useEffect, useState } from "react";
import { MainLayout } from "../../../components/layout/MainLayout";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "../../../components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TagInput } from "../../../components/ui/TagInput";
import { userApi } from "../../../lib/utils/api";

// Form validation schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  title: z.string().optional(),
  bio: z.string().optional(),
  notificationPreferences: z.object({
    email: z.boolean().default(true),
    inApp: z.boolean().default(true),
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      title: "",
      bio: "",
      notificationPreferences: {
        email: true,
        inApp: true,
      },
    },
  });

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  // Load user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === "authenticated") {
        setIsLoading(true);
        try {
          // Try to get from API using our centralized API client
          const userData = await userApi.getProfile(session?.user?.accessToken);

          if (userData) {
            reset({
              name: userData.name || session?.user?.name || "",
              email: userData.email || session?.user?.email || "",
              title: userData.title || "",
              bio: userData.bio || "",
              notificationPreferences: {
                email: userData.notificationPreferences?.email ?? true,
                inApp: userData.notificationPreferences?.inApp ?? true,
              },
            });
            setSkills(userData.skills || []);
          } else {
            // Fallback to localStorage
            const localData = localStorage.getItem(
              `onboarding-data-${session?.user?.id}`
            );
            if (localData) {
              const parsed = JSON.parse(localData);
              reset({
                name: parsed.name || session?.user?.name || "",
                email: parsed.email || session?.user?.email || "",
                title: parsed.title || "",
                bio: parsed.bio || "",
                notificationPreferences: {
                  email: parsed.notificationPreferences?.email ?? true,
                  inApp: parsed.notificationPreferences?.inApp ?? true,
                },
              });
              setSkills(parsed.skills || []);
            } else {
              // Fallback to session data
              reset({
                name: session?.user?.name || "",
                email: session?.user?.email || "",
              });
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Try localStorage as fallback
          const localData = localStorage.getItem(
            `onboarding-data-${session?.user?.id}`
          );
          if (localData) {
            const parsed = JSON.parse(localData);
            reset({
              name: parsed.name || session?.user?.name || "",
              email: parsed.email || session?.user?.email || "",
              title: parsed.title || "",
              bio: parsed.bio || "",
              notificationPreferences: {
                email: parsed.notificationPreferences?.email ?? true,
                inApp: parsed.notificationPreferences?.inApp ?? true,
              },
            });
            setSkills(parsed.skills || []);
          } else {
            // Fallback to session data
            reset({
              name: session?.user?.name || "",
              email: session?.user?.email || "",
            });
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [status, session, reset]);

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);

    try {
      // Include skills
      const profileData = {
        ...data,
        skills,
      };

      // Save to localStorage as backup
      if (session?.user?.id) {
        localStorage.setItem(
          `onboarding-data-${session.user.id}`,
          JSON.stringify(profileData)
        );
      }

      // Save to API using our centralized API client
      await userApi.updateProfile(profileData, session?.user?.accessToken);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("An error occurred while saving your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="py-10">
        <header className="mb-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Edit Profile
            </h1>
          </div>
        </header>

        <main>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg">
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {isLoading ? (
                  <div className="text-center py-4">
                    <p className="text-slate-500 dark:text-slate-400">
                      Loading your profile...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="form-label">
                          Full Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          {...register("name")}
                          className="form-input"
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="form-label">
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          {...register("email")}
                          disabled
                          className="form-input opacity-70 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Email cannot be changed
                        </p>
                      </div>

                      <div>
                        <label htmlFor="title" className="form-label">
                          Job Title
                        </label>
                        <input
                          id="title"
                          type="text"
                          {...register("title")}
                          placeholder="e.g. Software Engineer"
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="skills" className="form-label">
                          Skills
                        </label>
                        <TagInput
                          id="skills"
                          tags={skills}
                          setTags={setSkills}
                          placeholder="Add skills and press Enter"
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Add your skills and press Enter
                        </p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="bio" className="form-label">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        {...register("bio")}
                        rows={4}
                        placeholder="Tell us about yourself"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <h3 className="text-md font-medium text-slate-900 dark:text-white mb-3">
                        Notification Preferences
                      </h3>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="email-notifications"
                            type="checkbox"
                            {...register("notificationPreferences.email")}
                            className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-slate-300 rounded dark:border-slate-600"
                          />
                          <label
                            htmlFor="email-notifications"
                            className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
                          >
                            Email Notifications
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="inapp-notifications"
                            type="checkbox"
                            {...register("notificationPreferences.inApp")}
                            className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-slate-300 rounded dark:border-slate-600"
                          />
                          <label
                            htmlFor="inapp-notifications"
                            className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
                          >
                            In-App Notifications
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
