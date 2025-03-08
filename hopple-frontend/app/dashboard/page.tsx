"use client";

import React, { useEffect, useState } from "react";
import { MainLayout } from "../../components/layout/MainLayout";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useAuth } from "../../lib/context/AuthContext";
import { Button } from "../../components/ui/Button";
import { PlusIcon, PencilIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { userApi, projectApi } from "../../lib/utils/api";

// Types
interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  updatedAt: string;
}

interface UserProfile {
  name?: string;
  email?: string;
  title?: string;
  skills?: string[];
  notificationPreferences?: {
    email: boolean;
    inApp: boolean;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { hasCompletedOnboarding } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState({
    projects: true,
    profile: true,
  });

  // Redirect to sign in if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  // Redirect to onboarding if not completed
  if (status === "authenticated" && !hasCompletedOnboarding) {
    redirect("/onboarding");
  }

  // Load user data and projects
  useEffect(() => {
    if (status === "authenticated") {
      // Fetch user profile
      const fetchUserProfile = async () => {
        try {
          // Try to get from API using our centralized API client
          const userData = await userApi.getProfile(session?.user?.accessToken);

          if (userData) {
            setUserProfile(userData);
          } else {
            // Fallback to localStorage
            const localData = localStorage.getItem(
              `onboarding-data-${session?.user?.id}`
            );
            if (localData) {
              setUserProfile(JSON.parse(localData));
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Try localStorage as fallback
          const localData = localStorage.getItem(
            `onboarding-data-${session?.user?.id}`
          );
          if (localData) {
            setUserProfile(JSON.parse(localData));
          }
        } finally {
          setLoading((prev) => ({ ...prev, profile: false }));
        }
      };

      // Fetch projects
      const fetchProjects = async () => {
        try {
          // Use our centralized API client
          const projectsData = await projectApi.getProjects(
            session?.user?.accessToken
          );
          setProjects(projectsData || []);
        } catch (error) {
          console.error("Error fetching projects:", error);
          setProjects([]);
        } finally {
          setLoading((prev) => ({ ...prev, projects: false }));
        }
      };

      fetchUserProfile();
      fetchProjects();
    }
  }, [status, session]);

  return (
    <MainLayout>
      <div className="py-10">
        <header className="mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Dashboard
            </h1>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* User Profile Section */}
            <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">
                    My Profile
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                    Your personal and professional information
                  </p>
                </div>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm">
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700">
                <dl>
                  <div className="bg-slate-50 dark:bg-slate-900 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Full name
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">
                      {loading.profile
                        ? "Loading..."
                        : userProfile.name ||
                          session?.user?.name ||
                          "Not provided"}
                    </dd>
                  </div>

                  <div className="bg-white dark:bg-slate-800 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Email address
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">
                      {loading.profile
                        ? "Loading..."
                        : userProfile.email ||
                          session?.user?.email ||
                          "Not provided"}
                    </dd>
                  </div>

                  {userProfile.title && (
                    <div className="bg-slate-50 dark:bg-slate-900 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Job title
                      </dt>
                      <dd className="mt-1 text-sm text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">
                        {userProfile.title}
                      </dd>
                    </div>
                  )}

                  {userProfile.skills && userProfile.skills.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Skills
                      </dt>
                      <dd className="mt-1 text-sm text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">
                        <div className="flex flex-wrap gap-2">
                          {userProfile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-800 dark:text-violet-100"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Projects Section */}
            <div className="bg-white dark:bg-slate-800 shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">
                    My Projects
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                    Projects you're working on
                  </p>
                </div>
                <Link href="/projects/new">
                  <Button>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Project
                  </Button>
                </Link>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700">
                {loading.projects ? (
                  <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    Loading projects...
                  </div>
                ) : projects.length > 0 ? (
                  <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {projects.map((project) => (
                      <li key={project.id}>
                        <Link
                          href={`/projects/${project.id}`}
                          className="block hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-violet-600 dark:text-violet-400 truncate">
                                {project.name}
                              </h3>
                              <div className="ml-2 flex-shrink-0 flex">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    project.status === "completed"
                                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                      : project.status === "in-progress"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                  }`}
                                >
                                  {project.status
                                    ? `${project.status
                                        .charAt(0)
                                        .toUpperCase()}${project.status
                                        .slice(1)
                                        .replace("-", " ")}`
                                    : "Unknown"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {project.description}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400 sm:mt-0">
                                <p>
                                  Updated{" "}
                                  {new Date(
                                    project.updatedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      You don't have any projects yet.
                    </p>
                    <Link href="/projects/new">
                      <Button>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create your first project
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
